import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SpendingReportService {
  constructor(private prisma: PrismaService) { }

  /**
   * Pencarian data gabungan employee - department - spending.
   * Search bisa berdasarkan nama karyawan ATAU nama departemen.
   * Data selalu diurutkan berdasarkan value (nilai pengeluaran) ASC.
   */
  async search(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
        OR: [
          {
            employee: {
              employee_name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            employee: {
              department: {
                department_name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            },
          },
        ],
      }
      : {};

    const [spendings, total] = await Promise.all([
      this.prisma.spending.findMany({
        where,
        skip,
        take: limit,
        orderBy: { value: 'asc' },
        include: {
          employee: {
            include: {
              department: true,
            },
          },
        },
      }),
      this.prisma.spending.count({ where }),
    ]);

    return {
      data: spendings.map((spending) => ({
        id: spending.spending_id.toString(),
        spending_id: spending.spending_id,
        employee_id: spending.employee_id,
        employee_name: spending.employee?.employee_name ?? null,
        department_id: spending.employee?.department?.department_id ?? null,
        department_name: spending.employee?.department?.department_name ?? null,
        spending_date: spending.spending_date,
        value: spending.value,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Versi tanpa search, tetap terurut berdasarkan value ASC.
   * Berguna untuk menampilkan seluruh data gabungan.
   */
  async paginate(page: number = 1, limit: number = 10) {
    return this.search(undefined, page, limit);
  }
}
