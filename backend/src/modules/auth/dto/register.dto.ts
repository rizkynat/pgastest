import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsBoolean, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'full name is required' })
  full_name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @ApiProperty({
    example: '081234567890',
    description: 'User phone number',
    maxLength: 15,
  })
  @IsString()
  @IsNotEmpty({ message: 'phone number is required' })
  number_phone: string;

  @ApiProperty({
    example: '3283789273',
    description: 'User NIK',
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty({ message: 'NIK is required' })
  nik: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'User password (min 6 characters, at least one uppercase, one lowercase, one number)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number/special character',
  })
  password: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'User role',
  })
  @IsString()
  @IsNotEmpty({ message: 'role is required' })
  role: Role;

  @ApiProperty({
    example: true,
    description: 'User active status',
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'is_active is required' })
  is_active: boolean;

}
