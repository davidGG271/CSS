import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from '../../pedido/entities/pedido.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { PcArmada } from '../../pc-armada/entities/pc-armada.entity';

@Entity('detalle_pedidos')
export class DetallePedido {
  @PrimaryGeneratedColumn()
  idDetallePedido!: number;

  @Column()
  idPedido!: number;

  @ManyToOne(() => Pedido)
  @JoinColumn({ name: 'idPedido' })
  pedido!: Pedido;

  @Column({ nullable: true })
  idProducto?: number;

  @ManyToOne(() => Producto, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idProducto' })
  producto?: Producto;

  @Column({ nullable: true })
  idPcArmada?: number;

  @ManyToOne(() => PcArmada, (pcArmada) => pcArmada.detallesPedido, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPcArmada' })
  pcArmada?: PcArmada;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
