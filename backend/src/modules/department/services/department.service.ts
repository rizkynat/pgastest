import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) { }

  async findById(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { department_id: id }
    });

    if (!department) return null;

    return {
      ...department,
      id: department.department_id.toString(),
    };
  }

  async search(
    search?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
        department_name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
      : {};

    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.department.count({ where })
    ]);

    return {
      data: departments.map(department => ({
        ...department,
        id: department.department_id.toString()
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

    const [department, total] = await Promise.all([
      this.prisma.department.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.department.count()
    ]);

    return {
      data: department.map(department => ({
        ...department,
        id: department.department_id.toString()
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async create(departmentData: { department_name: string }) {
    const department = await this.prisma.department.create({
      data: {
        department_name: departmentData.department_name,
      },
    });

    return {
      ...department,
      id: String(department.department_id),
    };
  }

  async update(
    department_id: number,
    departmentData: { department_name?: string },
  ) {
    const data: any = {};

    if (departmentData.department_name !== undefined) {
      data.department_name = departmentData.department_name;
    }

    const department = await this.prisma.department.update({
      where: { department_id },
      data,
    });

    return {
      ...department,
      id: department.department_id.toString(),
    };
  }

  async delete(department_id: number) {
    const department = await this.prisma.department.findUnique({
      where: { department_id },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    const deletedDepartment = await this.prisma.department.delete({
      where: { department_id },
    });

    return {
      ...deletedDepartment,
      id: deletedDepartment.department_id.toString(),
    };
  }

  async generateExcel(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('department');
    const datas = await this.prisma.department.findMany();

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nama Departemen', key: 'department_name', width: 30 },
      { header: 'Create At', key: 'createdAt', width: 30 },
      { header: 'Update At', key: 'updateAt', width: 30 },
    ];

    datas.forEach((item) => {
      worksheet.addRow({
        id: item.department_id,
        department_name: item.department_name,
        createdAt: item.createdAt,
        updateAt: item.updatedAt,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}