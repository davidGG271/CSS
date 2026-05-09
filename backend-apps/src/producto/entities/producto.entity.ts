import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PcArmadaProducto } from '../../pc-armada-producto/entities/pc-armada-producto.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  idProducto!: number;

  @Column({ type: 'varchar', length: 80 })
  nombre!: string;

  @Column({ type: 'varchar', length: 40 })
  marca!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'int' })
  stock!: number;

  @Column({ type: 'varchar', length: 30 })
  categoria!: string;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ type: 'bytea', nullable: true })
  imagen?: Buffer;

  @Column({ type: 'varchar', length: 300 })
  descripcion!: string;

  @OneToMany(() => PcArmadaProducto, (pcArmadaProducto) => pcArmadaProducto.producto)
  pcArmadas!: PcArmadaProducto[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
