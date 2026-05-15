import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CarritoCompras } from '../../carrito-compras/entities/carrito-compras.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { PcArmada } from '../../pc-armada/entities/pc-armada.entity';

@Entity('detalle_carrito')
export class DetalleCarrito {
  @PrimaryGeneratedColumn()
  idDetalleCarrito!: number;

  @Column()
  idCarrito!: number;

  @ManyToOne(() => CarritoCompras, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCarrito' })
  carrito!: CarritoCompras;

  @Column({ nullable: true })
  idProducto?: number;

  @ManyToOne(() => Producto, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idProducto' })
  producto?: Producto;

  @Column({ nullable: true })
  idPcArmada?: number;

  @ManyToOne(() => PcArmada, (pcArmada) => pcArmada.detallesCarrito, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPcArmada' })
  pcArmada?: PcArmada;

  @Column({ type: 'int' })
  cantidad!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
