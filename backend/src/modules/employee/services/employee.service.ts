import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Role } from '../../../common/enums/role.enum';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) { }

  async findById(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: id }
    });

    if (!employee) return null;

    return {
      ...employee,
      id: employee.employee_id.toString(),
    };
  }

  async search(
    search?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const orConditions: any[] = [];

    if (search) {
      orConditions.push({
        employee_name: { contains: search, mode: 'insensitive' },
      });

      // department_id adalah foreign key numerik, contains/insensitive tidak valid di sana.
      // Hanya cocokkan sebagai equals kalau search-nya berupa angka.
      const asNumber = Number(search);
      if (!Number.isNaN(asNumber)) {
        orConditions.push({ department_id: asNumber });
      }
    }

    const where = search ? { OR: orConditions } : {};

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.employee.count({ where })
    ]);

    return {
      data: employees.map(employee => ({
        ...employee,
        id: employee.employee_id.toString()
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

    const [employee, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.employee.count()
    ]);

    return {
      data: employee.map(employee => ({
        ...employee,
        id: employee.employee_id.toString()
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async create(employeeData: { employee_name: string; department_id: number }) {
    const employee = await this.prisma.employee.create({
      data: {
        employee_name: employeeData.employee_name,
        department_id: employeeData.department_id
      },
    });

    return {
      ...employee,
      id: String(employee.employee_id),
    };
  }

  async update(
    employee_id: number,
    employeeData: {
      employee_name?: string;
      department_id?: number;
    },
  ) {
    const data: any = {};

    if (employeeData.employee_name !== undefined) {
      data.employee_name = employeeData.employee_name;
    }
    if (employeeData.department_id !== undefined) {
      data.department_id = Number(employeeData.department_id);
    }

    const employee = await this.prisma.employee.update({
      where: { employee_id },
      data,
    });

    return {
      ...employee,
      id: employee.employee_id.toString(),
    };
  }

  async delete(employee_id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const deletedEmployee = await this.prisma.employee.delete({
      where: { employee_id },
    });

    return {
      ...deletedEmployee,
      id: deletedEmployee.employee_id.toString(),
    };
  }

  async generateExcel(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('employee');
    const datas = await this.prisma.employee.findMany();

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nama Karyawan', key: 'employee_name', width: 30 },
      { header: 'Department', key: 'department_id', width: 30 },
      { header: 'Create At', key: 'createdAt', width: 30 },
      { header: 'Update At', key: 'updateAt', width: 30 },
    ];

    datas.forEach((item) => {
      worksheet.addRow({
        id: item.employee_id,
        employee_name: item.employee_name,
        department: item.department_id,
        createdAt: item.createdAt,
        updateAt: item.updatedAt,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}