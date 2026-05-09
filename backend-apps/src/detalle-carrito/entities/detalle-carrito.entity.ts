import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CarritoCompras } from '../../carrito-compras/entities/carrito-compras.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { PcArmada } from '../../pc-armada/entities/pc-armada.entity';

@Entity('detalle_carrito')
export class DetalleCarrito {
  @PrimaryColumn()
  idCarrito!: number;

  @ManyToOne(() => CarritoCompras)
  @JoinColumn({ name: 'idCarrito' })
  carrito!: CarritoCompras;

  @PrimaryColumn()
  idProducto?: number;

  @ManyToOne(() => Producto, { nullable: true })
  @JoinColumn({ name: 'idProducto' })
  producto?: Producto;

  @Column({ nullable: true })
  idPcArmada?: number;

  @ManyToOne(() => PcArmada, (pcArmada) => pcArmada.detallesCarrito, { nullable: true })
  @JoinColumn({ name: 'idPcArmada' })
  pcArmada?: PcArmada;

  @Column({ type: 'varchar', length: 40 })
  TipoCompra!: string;

  @Column({ type: 'boolean', default: true })
  isVisible!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
