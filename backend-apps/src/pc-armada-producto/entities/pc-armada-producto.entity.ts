import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PcArmada } from '../../pc-armada/entities/pc-armada.entity';
import { Producto } from '../../producto/entities/producto.entity';

@Entity('pc_armada_producto')
export class PcArmadaProducto {
  @PrimaryColumn()
  idPcArmada!: number;

  @ManyToOne(() => PcArmada, (pcArmada) => pcArmada.productos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPcArmada' })
  pcArmada!: PcArmada;

  @PrimaryColumn()
  idProducto!: number;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idProducto' })
  producto!: Producto;

  @Column({ type: 'varchar', length: 80 })
  cantidad!: string;
}
