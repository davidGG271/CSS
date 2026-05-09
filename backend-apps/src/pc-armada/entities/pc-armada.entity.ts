import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { PcArmadaProducto } from '../../pc-armada-producto/entities/pc-armada-producto.entity';
import { DetallePedido } from '../../detalle-pedido/entities/detalle-pedido.entity';
import { DetalleCarrito } from '../../detalle-carrito/entities/detalle-carrito.entity';

@Entity('pc_armada')
export class PcArmada {
  @PrimaryGeneratedColumn()
  idPcArmada!: number;

  @Column({ nullable: true })
  idCliente?: number;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'idCliente' })
  cliente?: Cliente;

  @Column({ nullable: true })
  idAdmin?: number;

  @ManyToOne(() => Admin, (admin) => admin.pcArmadas, { nullable: true })
  @JoinColumn({ name: 'idAdmin' })
  admin?: Admin;

  @Column({ type: 'varchar', length: 80 })
  nombre!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'int' })
  stock!: number;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ type: 'bytea', nullable: true })
  imagen?: Buffer;

  @Column({ type: 'varchar', length: 300 })
  descripcion!: string;

  @OneToMany(() => PcArmadaProducto, (pcArmadaProducto) => pcArmadaProducto.pcArmada, { cascade: true })
  productos!: PcArmadaProducto[];

  @OneToMany(() => DetallePedido, (detallePedido) => detallePedido.pcArmada, { cascade: true })
  detallesPedido!: DetallePedido[];

  @OneToMany(() => DetalleCarrito, (detalleCarrito) => detalleCarrito.pcArmada, { cascade: true })
  detallesCarrito!: DetalleCarrito[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
