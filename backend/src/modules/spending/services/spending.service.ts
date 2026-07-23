import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class SpendingService {
  constructor(private prisma: PrismaService) { }

  async findById(id: number) {
    const spending = await this.prisma.spending.findUnique({
      where: { spending_id: id },
      include: { employee: true },
    });

    if (!spending) return null;

    return {
      ...spending,
      id: spending.spending_id.toString(),
    };
  }

  async search(
    search?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    // Search dilakukan berdasarkan nama karyawan (relasi employee),
    // karena spending sendiri tidak punya kolom string untuk di-search.
    const where = search
      ? {
        employee: {
          employee_name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      }
      : {};

    const [spendings, total] = await Promise.all([
      this.prisma.spending.findMany({
        where,
        skip,
        take: limit,
        orderBy: { spending_date: 'desc' },
        include: { employee: true },
      }),
      this.prisma.spending.count({ where })
    ]);

    return {
      data: spendings.map(spending => ({
        ...spending,
        id: spending.spending_id.toString()
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async paginate(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [spendings, total] = await Promise.all([
      this.prisma.spending.findMany({
        skip,
        take: limit,
        orderBy: { spending_date: 'desc' },
        include: { employee: true },
      }),
      this.prisma.spending.count()
    ]);

    return {
      data: spendings.map(spending => ({
        ...spending,
        id: spending.spending_id.toString()
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async create(spendingData: {
    employee_id: number;
    spending_date: Date | string;
    value: number;
  }) {
    const spending = await this.prisma.spending.create({
      data: {
        employee_id: spendingData.employee_id,
        spending_date: new Date(spendingData.spending_date),
        value: spendingData.value,
      },
    });

    return {
      ...spending,
      id: String(spending.spending_id),
    };
  }

  async update(
    spending_id: number,
    spendingData: {
      employee_id?: number;
      spending_date?: Date | string;
      value?: number;
    },
  ) {
    const data: any = {};

    if (spendingData.employee_id !== undefined) {
      data.employee_id = spendingData.employee_id;
    }

    if (spendingData.spending_date !== undefined) {
      data.spending_date = new Date(spendingData.spending_date);
    }

    if (spendingData.value !== undefined) {
      data.value = spendingData.value;
    }

    const spending = await this.prisma.spending.update({
      where: { spending_id },
      data,
    });

    return {
      ...spending,
      id: spending.spending_id.toString(),
    };
  }

  async delete(spending_id: number) {
    const spending = await this.prisma.spending.findUnique({
      where: { spending_id },
    });

    if (!spending) {
      throw new Error("Spending not found");
    }

    const deletedSpending = await this.prisma.spending.delete({
      where: { spending_id },
    });

    return {
      ...deletedSpending,
      id: deletedSpending.spending_id.toString(),
    };
  }

  async generateExcel(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('spending');
    const datas = await this.prisma.spending.findMany({
      include: { employee: true },
      orderBy: { spending_date: 'desc' },
    });

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'ID Karyawan', key: 'employee_id', width: 15 },
      { header: 'Nama Karyawan', key: 'employee_name', width: 30 },
      { header: 'Tanggal Spending', key: 'spending_date', width: 20 },
      { header: 'Nilai', key: 'value', width: 20 },
      { header: 'Create At', key: 'createdAt', width: 30 },
      { header: 'Update At', key: 'updateAt', width: 30 },
    ];

    datas.forEach((item: any) => {
      worksheet.addRow({
        id: item.spending_id,
        employee_id: item.employee_id,
        employee_name: item.employee?.employee_name ?? '-',
        spending_date: item.spending_date,
        value: item.value,
        createdAt: item.createdAt,
        updateAt: item.updatedAt,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
