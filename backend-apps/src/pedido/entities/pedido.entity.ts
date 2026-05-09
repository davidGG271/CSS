import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { DetallePedido } from '../../detalle-pedido/entities/detalle-pedido.entity';
import { Pago } from '../../pago/entities/pago.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  idPedido!: number;

  @Column()
  idCliente!: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'idCliente' })
  cliente!: Cliente;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, { cascade: true })
  detalles!: DetallePedido[];

  @OneToMany(() => Pago, (pago) => pago.pedido, { cascade: true })
  pagos!: Pago[];

  @Column({ type: 'varchar', length: 40 })
  TipoCompra!: string;

  @Column({ type: 'varchar', length: 20 })
  Estado!: string;

  @Column({ type: 'date' })
  fecha!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
