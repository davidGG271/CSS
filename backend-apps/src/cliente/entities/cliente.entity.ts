import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pedido } from '../../pedido/entities/pedido.entity';
import { CarritoCompras } from '../../carrito-compras/entities/carrito-compras.entity';
import { PcArmada } from '../../pc-armada/entities/pc-armada.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  idCliente!: number;

  @Column({ type: 'varchar', length: 70 })
  nombre!: string;

  @Column({ type: 'varchar', length: 8, unique: true })
  dni!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  correo!: string;

  @Column({ type: 'varchar', length: 255 })
  contrasena!: string;

  @OneToMany(() => Pedido, (pedido) => pedido.cliente, { cascade: true })
  pedidos!: Pedido[];

  @OneToMany(() => CarritoCompras, (carrito) => carrito.cliente, { cascade: true })
  carritos!: CarritoCompras[];

  @OneToMany(() => PcArmada, (pcArmada) => pcArmada.cliente, { cascade: true })
  pcArmadas!: PcArmada[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
