import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Role } from '../../../common/enums/role.enum';
import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      return {
        ...user,
        id: String(user.id),
      };
    }
    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id }
    });

    if (!user) return null;

    return {
      ...user,
      id: user.id.toString(),
    };
  }

  async search(
    search?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const searchableFields = [
      'full_name',
      'email',
    ];

    const where = search
      ? {
        OR: searchableFields.map(field => ({
          [field]: {
            contains: search,
            mode: 'insensitive'
          }
        }))
      }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdat: 'desc'
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data: users.map(user => ({
        ...user,
        id: user.id.toString()
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

    const [user, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          createdat: 'desc'
        }
      }),
      this.prisma.user.count()
    ]);

    return {
      data: user.map(user => ({
        ...user,
        id: user.id.toString()
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }


  async create(userData: { full_name: string; email: string; number_phone: string, nik: string, photo: string, password: string; role?: Role, is_active?: boolean }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        full_name: userData.full_name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        is_active: userData.is_active ?? true,

        // ✅ field baru
        nik: userData.nik,
        number_phone: userData.number_phone,
        photo: userData.photo, // hanya nama file
      },
    });

    return {
      ...user,
      id: String(user.id),
    };
  }


  async update(
    id: string,
    userData: {
      full_name?: string;
      email?: string;
      password?: string;
      role?: Role;
      is_active?: boolean;
      number_phone?: string;
      nik?: string;
      photo?: string;
    },
  ) {
    const data: any = { ...userData };

    if (userData.password) {
      data.password = await bcrypt.hash(userData.password, 10);
    } else {
      delete data.password;
    }

    if (typeof userData.is_active === "string") {
      data.is_active = userData.is_active === "true";
    }

    if (!userData.photo) {
      delete data.photo;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return {
      ...user,
      id: user.id.toString(),
    };
  }

async delete(id: string) {

  const user = await this.prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.photo) {
    const filePath = path.join(process.cwd(), "uploads", user.photo);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  const deletedUser = await this.prisma.user.delete({
    where: { id },
  });

  return {
    ...deletedUser,
    id: deletedUser.id.toString(),
  };
}

  async generateExcel(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('user');
    const datas = await this.prisma.user.findMany();

    worksheet.columns = [{ header: 'ID', key: 'id', width: 10 },
    { header: 'Nama Lengkap', key: 'full_name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 30 },
    { header: 'Status Akun', key: 'is_active', width: 30 }]

    datas.forEach((item) => {
      worksheet.addRow(item);
    })

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }


}
