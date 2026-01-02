import { AppDataSource } from "../../data-source"
import {
  Alert,
  AlertPriority,
  AlertStatus,
  AlertType,
} from "../../entities/Alert"
import { BranchProduct } from "../../entities/BranchProduct"
import { StockRequest } from "../../entities/StockRequest"
import { User } from "../../entities/user"
import { LessThan, In, Not, IsNull } from "typeorm"

const CRITICAL_THRESHOLD = 10
const LOW_STOCK_THRESHOLD = 30

export class AlertService {
  static async getAlerts(
    query: any,
    page: number = 1,
    limit: number = 10,
    user?: User
  ) {
    const { status, priority, branchId, type } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (status) where.status = status
    if (priority) where.priority = priority
    if (branchId) where.branchId = branchId
    if (type) where.type = type

    // If user is BRANCH_MANAGER, restrict to their branch
    // Assuming role checking is done in controller or here.
    // For now, if branchId is passed it filters.

    const [alerts, total] = await AppDataSource.getRepository(
      Alert
    ).findAndCount({
      where,
      relations: ["branch", "product", "acknowledgedBy", "resolvedBy"],
      order: {
        priority: "ASC", // "CRITICAL" comes before "HIGH" alphabetically? No.
        // Enum values are strings. We need custom sort or rely on created date/priority logic.
        // For simple string enum sort: CRITICAL < HIGH < LOW is not alphabetical (C, H, L, M).
        // C(ritical), H(igh), L(ow), M(edium).
        // Let's sort by createdAt DESC for now, or we can handle priority in query builder if needed.
        createdAt: "DESC",
      },
      skip,
      take: limit,
    })

    return {
      alerts,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async acknowledgeAlert(alertId: string, userId: string) {
    const alertRepo = AppDataSource.getRepository(Alert)
    const alert = await alertRepo.findOne({ where: { id: alertId } })

    if (!alert) throw new Error("Alert not found")
    if (alert.status !== AlertStatus.NEW) {
      // Can act on already acknowledged? Ideally yes, just updates info.
      // But if resolved, maybe not.
    }

    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledgedBy = { id: userId } as User
    alert.acknowledgedAt = new Date()

    return await alertRepo.save(alert)
  }

  static async resolveAlert(alertId: string, userId: string) {
    const alertRepo = AppDataSource.getRepository(Alert)
    const alert = await alertRepo.findOne({ where: { id: alertId } })

    if (!alert) throw new Error("Alert not found")

    alert.status = AlertStatus.RESOLVED
    alert.resolvedBy = { id: userId } as User
    alert.resolvedAt = new Date()

    return await alertRepo.save(alert)
  }

  static async generateStockAlerts() {
    const branchProductRepo = AppDataSource.getRepository(BranchProduct)
    const alertRepo = AppDataSource.getRepository(Alert)
    const stockRequestRepo = AppDataSource.getRepository(StockRequest)

    const branchProducts = await branchProductRepo.find({
      relations: ["branch", "product"],
    })

    let createdCount = 0

    for (const bp of branchProducts) {
      if (!bp.product || !bp.branch) continue // Safety check

      const qty = Number(bp.quantity)

      // 1. Check CRITICAL
      if (qty <= CRITICAL_THRESHOLD) {
        await this.createOrUpdateAlert(
          alertRepo,
          bp,
          AlertType.CRITICAL_STOCK,
          AlertPriority.CRITICAL,
          `CRITICAL: ${bp.product.name} at ${bp.branch.name} is at critically low stock (${qty} ${bp.product.unit} remaining)`
        )
      }
      // 2. Check LOW STOCK
      else if (qty <= LOW_STOCK_THRESHOLD) {
        await this.createOrUpdateAlert(
          alertRepo,
          bp,
          AlertType.LOW_STOCK,
          AlertPriority.HIGH,
          `LOW STOCK: ${bp.product.name} at ${bp.branch.name} needs reordering (${qty} ${bp.product.unit} remaining)`
        )
      }

      // 3. Check LATE ORDER
      // Logic: If active alerts exist (Low or Critical) AND no active Stock Request exists
      if (qty <= LOW_STOCK_THRESHOLD) {
        // Check for active requests for this product & branch
        // Active = PENDING, APPROVED, DISPATCHED
        // We need to look at StockRequestItems actually, referencing this product.
        // This is a bit complex if we don't have direct relation, but let's try.

        const hasActiveRequest = await stockRequestRepo
          .createQueryBuilder("sr")
          .leftJoin("sr.items", "item")
          .where("sr.branchId = :branchId", { branchId: bp.branch.id })
          .andWhere("item.productId = :productId", { productId: bp.product.id })
          .andWhere("sr.status IN (:...statuses)", {
            statuses: ["PENDING", "APPROVED", "DISPATCHED"],
          })
          .getCount()

        if (hasActiveRequest === 0) {
          await this.createOrUpdateAlert(
            alertRepo,
            bp,
            AlertType.LATE_ORDER,
            AlertPriority.HIGH,
            `LATE ORDER: ${bp.product.name} at ${bp.branch.name} is low on stock but no order has been placed recently`
          )
        }
      }
    }

    return { message: "Alerts generation completed" }
  }

  private static async createOrUpdateAlert(
    repo: any,
    bp: BranchProduct,
    type: AlertType,
    priority: AlertPriority,
    message: string
  ) {
    // Check if an active alert (NEW or ACKNOWLEDGED) of this type already exists for this branch+product
    const existing = await repo.findOne({
      where: {
        branchId: bp.branch.id,
        productId: bp.product.id,
        type: type,
        status: In([AlertStatus.NEW, AlertStatus.ACKNOWLEDGED]),
      },
    })

    if (!existing) {
      const newAlert = repo.create({
        branchId: bp.branch.id,
        productId: bp.product.id,
        type,
        priority,
        message,
        status: AlertStatus.NEW,
      })
      await repo.save(newAlert)
    } else {
      // Optionally update message or timestamp if needed, but usually we just leave it until resolved.
      // Maybe update priority if it changed? For now, leave it.
    }
  }
}
