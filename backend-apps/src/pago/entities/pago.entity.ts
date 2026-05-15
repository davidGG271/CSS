import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from '../../pedido/entities/pedido.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  idPago!: number;

  @Column()
  idPedido!: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.pagos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPedido' })
  pedido!: Pedido;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ type: 'varchar', length: 30 })
  metodoPago!: string;

  @Column({ type: 'varchar', length: 20 })
  estado!: string;

  @Column({ type: 'date' })
  fechaPago!: Date;

  @Column({ type: 'varchar', length: 100 })
  codigoTransaccion!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
