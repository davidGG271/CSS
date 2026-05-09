import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { DetalleCarrito } from '../../detalle-carrito/entities/detalle-carrito.entity';

@Entity('carrito_compras')
export class CarritoCompras {
  @PrimaryGeneratedColumn()
  idCarrito!: number;

  @Column()
  idCliente!: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'idCliente' })
  cliente!: Cliente;

  @OneToMany(() => DetalleCarrito, (detalle) => detalle.carrito, { cascade: true })
  detalles!: DetalleCarrito[];

  @Column({ type: 'boolean', default: true })
  isVisible!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
