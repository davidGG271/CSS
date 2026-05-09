import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PcArmada } from '../../pc-armada/entities/pc-armada.entity';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 70 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  correo!: string;

  @Column({ type: 'varchar', length: 255 })
  contrasena!: string;

  @OneToMany(() => PcArmada, (pcArmada) => pcArmada.admin, { cascade: true })
  pcArmadas!: PcArmada[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
