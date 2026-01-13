using System;
using System.Collections.Generic;
using Kemak.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Kemak.Infrastructure.Data;

public partial class KemakDbContext : DbContext
{
    public KemakDbContext()
    {
    }

    public KemakDbContext(DbContextOptions<KemakDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AlquilerToldo> AlquilerToldos { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<DetalleVentum> DetalleVenta { get; set; }

    public virtual DbSet<Imagen> Imagens { get; set; }

    public virtual DbSet<ItemProductoLicorerium> ItemProductoLicoreria { get; set; }

    public virtual DbSet<ItemProductoMayoristum> ItemProductoMayorista { get; set; }

    public virtual DbSet<ItemToldo> ItemToldos { get; set; }

    public virtual DbSet<ItemVentum> ItemVenta { get; set; }

    public virtual DbSet<ProductoLicorerium> ProductoLicoreria { get; set; }

    public virtual DbSet<ProductoMayoristum> ProductoMayorista { get; set; }

    public virtual DbSet<Rol> Rols { get; set; }

    public virtual DbSet<Toldo> Toldos { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<Ventum> Venta { get; set; }

    public virtual DbSet<VwDisponibilidadToldo> VwDisponibilidadToldos { get; set; }

    public virtual DbSet<VwVentasCompleta> VwVentasCompletas { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
=> optionsBuilder.UseNpgsql("Host=localhost;Database=kemak_db;Username=postgres;Password=SQL");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AlquilerToldo>(entity =>
        {
            entity.HasKey(e => e.IdAlquiler).HasName("alquiler_toldo_pkey");

            entity.ToTable("alquiler_toldo");

            entity.HasIndex(e => e.Estado, "idx_alquiler_estado");

            entity.HasIndex(e => new { e.IdToldo, e.FechaInicio, e.FechaFin }, "idx_alquiler_toldo_fechas");

            entity.Property(e => e.IdAlquiler).HasColumnName("id_alquiler");
            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .HasDefaultValueSql("'ACTIVO'::character varying")
                .HasColumnName("estado");
            entity.Property(e => e.FechaDevolucion).HasColumnName("fecha_devolucion");
            entity.Property(e => e.FechaFin).HasColumnName("fecha_fin");
            entity.Property(e => e.FechaInicio).HasColumnName("fecha_inicio");
            entity.Property(e => e.IdToldo).HasColumnName("id_toldo");
            entity.Property(e => e.IdVenta).HasColumnName("id_venta");
            entity.Property(e => e.Observaciones)
                .HasMaxLength(255)
                .HasColumnName("observaciones");

            entity.HasOne(d => d.IdToldoNavigation).WithMany(p => p.AlquilerToldos)
                .HasForeignKey(d => d.IdToldo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("alquiler_toldo_id_toldo_fkey");

            entity.HasOne(d => d.IdVentaNavigation).WithMany(p => p.AlquilerToldos)
                .HasForeignKey(d => d.IdVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("alquiler_toldo_id_venta_fkey");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.IdCliente).HasName("cliente_pkey");

            entity.ToTable("cliente");

            entity.HasIndex(e => e.Dni, "idx_cliente_dni");

            entity.HasIndex(e => e.Telefono, "idx_cliente_telefono");

            entity.Property(e => e.IdCliente).HasColumnName("id_cliente");
            entity.Property(e => e.Activo)
                .HasDefaultValue((short)1)
                .HasColumnName("activo");
            entity.Property(e => e.Direccion)
                .HasMaxLength(200)
                .HasColumnName("direccion");
            entity.Property(e => e.Dni)
                .HasMaxLength(20)
                .HasColumnName("dni");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_registro");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.Telefono)
                .HasMaxLength(20)
                .HasColumnName("telefono");
        });

        modelBuilder.Entity<DetalleVentum>(entity =>
        {
            entity.HasKey(e => e.IdDetalle).HasName("detalle_venta_pkey");

            entity.ToTable("detalle_venta");

            entity.Property(e => e.IdDetalle).HasColumnName("id_detalle");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.IdItem).HasColumnName("id_item");
            entity.Property(e => e.IdVenta).HasColumnName("id_venta");
            entity.Property(e => e.PrecioUnitario)
                .HasPrecision(10, 2)
                .HasColumnName("precio_unitario");
            entity.Property(e => e.Subtotal)
                .HasPrecision(10, 2)
                .HasComputedColumnSql("((cantidad)::numeric * precio_unitario)", true)
                .HasColumnName("subtotal");

            entity.HasOne(d => d.IdItemNavigation).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.IdItem)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("detalle_venta_id_item_fkey");

            entity.HasOne(d => d.IdVentaNavigation).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.IdVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("detalle_venta_id_venta_fkey");
        });

        modelBuilder.Entity<Imagen>(entity =>
        {
            entity.HasKey(e => e.IdImagen).HasName("imagen_pkey");

            entity.ToTable("imagen");

            entity.HasIndex(e => new { e.TipoEntidad, e.IdEntidad }, "idx_imagen_entidad");

            entity.Property(e => e.IdImagen).HasColumnName("id_imagen");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(255)
                .HasColumnName("descripcion");
            entity.Property(e => e.IdEntidad).HasColumnName("id_entidad");
            entity.Property(e => e.Orden)
                .HasDefaultValue(0)
                .HasColumnName("orden");
            entity.Property(e => e.TipoEntidad)
                .HasMaxLength(20)
                .HasColumnName("tipo_entidad");
            entity.Property(e => e.Url)
                .HasMaxLength(255)
                .HasColumnName("url");
        });

        modelBuilder.Entity<ItemProductoLicorerium>(entity =>
        {
            entity.HasKey(e => e.IdItem).HasName("item_producto_licoreria_pkey");

            entity.ToTable("item_producto_licoreria");

            entity.HasIndex(e => e.IdProducto, "item_producto_licoreria_id_producto_key").IsUnique();

            entity.Property(e => e.IdItem)
                .ValueGeneratedNever()
                .HasColumnName("id_item");
            entity.Property(e => e.IdProducto).HasColumnName("id_producto");

            entity.HasOne(d => d.IdItemNavigation).WithOne(p => p.ItemProductoLicorerium)
                .HasForeignKey<ItemProductoLicorerium>(d => d.IdItem)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("item_producto_licoreria_id_item_fkey");

            entity.HasOne(d => d.IdProductoNavigation).WithOne(p => p.ItemProductoLicorerium)
                .HasForeignKey<ItemProductoLicorerium>(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("item_producto_licoreria_id_producto_fkey");
        });

        modelBuilder.Entity<ItemProductoMayoristum>(entity =>
        {
            entity.HasKey(e => e.IdItem).HasName("item_producto_mayorista_pkey");

            entity.ToTable("item_producto_mayorista");

            entity.HasIndex(e => e.IdProducto, "item_producto_mayorista_id_producto_key").IsUnique();

            entity.Property(e => e.IdItem)
                .ValueGeneratedNever()
                .HasColumnName("id_item");
            entity.Property(e => e.IdProducto).HasColumnName("id_producto");

            entity.HasOne(d => d.IdItemNavigation).WithOne(p => p.ItemProductoMayoristum)
                .HasForeignKey<ItemProductoMayoristum>(d => d.IdItem)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("item_producto_mayorista_id_item_fkey");

            entity.HasOne(d => d.IdProductoNavigation).WithOne(p => p.ItemProductoMayoristum)
                .HasForeignKey<ItemProductoMayoristum>(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("item_producto_mayorista_id_producto_fkey");
        });

        modelBuilder.Entity<ItemToldo>(entity =>
        {
            entity.HasKey(e => e.IdItem).HasName("item_toldo_pkey");

            entity.ToTable("item_toldo");

            entity.HasIndex(e => e.IdToldo, "item_toldo_id_toldo_key").IsUnique();

            entity.Property(e => e.IdItem)
                .ValueGeneratedNever()
                .HasColumnName("id_item");
            entity.Property(e => e.IdToldo).HasColumnName("id_toldo");

            entity.HasOne(d => d.IdItemNavigation).WithOne(p => p.ItemToldo)
                .HasForeignKey<ItemToldo>(d => d.IdItem)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("item_toldo_id_item_fkey");

            entity.HasOne(d => d.IdToldoNavigation).WithOne(p => p.ItemToldo)
                .HasForeignKey<ItemToldo>(d => d.IdToldo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("item_toldo_id_toldo_fkey");
        });

        modelBuilder.Entity<ItemVentum>(entity =>
        {
            entity.HasKey(e => e.IdItem).HasName("item_venta_pkey");

            entity.ToTable("item_venta");

            entity.Property(e => e.IdItem).HasColumnName("id_item");
            entity.Property(e => e.TipoItem)
                .HasMaxLength(20)
                .HasColumnName("tipo_item");
        });

        modelBuilder.Entity<ProductoLicorerium>(entity =>
        {
            entity.HasKey(e => e.IdProducto).HasName("producto_licoreria_pkey");

            entity.ToTable("producto_licoreria");

            entity.Property(e => e.IdProducto).HasColumnName("id_producto");
            entity.Property(e => e.Activo)
                .HasDefaultValue((short)1)
                .HasColumnName("activo");
            entity.Property(e => e.Categoria)
                .HasMaxLength(50)
                .HasColumnName("categoria");
            entity.Property(e => e.Marca)
                .HasMaxLength(50)
                .HasColumnName("marca");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.Precio)
                .HasPrecision(10, 2)
                .HasColumnName("precio");
            entity.Property(e => e.Stock).HasColumnName("stock");
        });

        modelBuilder.Entity<ProductoMayoristum>(entity =>
        {
            entity.HasKey(e => e.IdProducto).HasName("producto_mayorista_pkey");

            entity.ToTable("producto_mayorista");

            entity.Property(e => e.IdProducto).HasColumnName("id_producto");
            entity.Property(e => e.Activo)
                .HasDefaultValue((short)1)
                .HasColumnName("activo");
            entity.Property(e => e.Categoria)
                .HasMaxLength(50)
                .HasColumnName("categoria");
            entity.Property(e => e.Marca)
                .HasMaxLength(50)
                .HasColumnName("marca");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.Precio)
                .HasPrecision(10, 2)
                .HasColumnName("precio");
            entity.Property(e => e.Presentacion)
                .HasMaxLength(50)
                .HasColumnName("presentacion");
            entity.Property(e => e.Stock).HasColumnName("stock");
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(e => e.IdRol).HasName("rol_pkey");

            entity.ToTable("rol");

            entity.HasIndex(e => e.Nombre, "rol_nombre_key").IsUnique();

            entity.Property(e => e.IdRol).HasColumnName("id_rol");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(150)
                .HasColumnName("descripcion");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Toldo>(entity =>
        {
            entity.HasKey(e => e.IdToldo).HasName("toldo_pkey");

            entity.ToTable("toldo");

            entity.Property(e => e.IdToldo).HasColumnName("id_toldo");
            entity.Property(e => e.Activo)
                .HasDefaultValue((short)1)
                .HasColumnName("activo");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(150)
                .HasColumnName("descripcion");
            entity.Property(e => e.Modelo)
                .HasMaxLength(100)
                .HasColumnName("modelo");
            entity.Property(e => e.PrecioAlquiler)
                .HasPrecision(10, 2)
                .HasColumnName("precio_alquiler");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("usuario_pkey");

            entity.ToTable("usuario");

            entity.HasIndex(e => e.Username, "usuario_username_key").IsUnique();

            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Estado)
                .HasDefaultValue((short)1)
                .HasColumnName("estado");
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha_creacion");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .HasColumnName("username");

            entity.HasMany(d => d.IdRols).WithMany(p => p.IdUsuarios)
                .UsingEntity<Dictionary<string, object>>(
                    "UsuarioRol",
                    r => r.HasOne<Rol>().WithMany()
                        .HasForeignKey("IdRol")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("usuario_rol_id_rol_fkey"),
                    l => l.HasOne<Usuario>().WithMany()
                        .HasForeignKey("IdUsuario")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("usuario_rol_id_usuario_fkey"),
                    j =>
                    {
                        j.HasKey("IdUsuario", "IdRol").HasName("usuario_rol_pkey");
                        j.ToTable("usuario_rol");
                        j.IndexerProperty<int>("IdUsuario").HasColumnName("id_usuario");
                        j.IndexerProperty<int>("IdRol").HasColumnName("id_rol");
                    });
        });

        modelBuilder.Entity<Ventum>(entity =>
        {
            entity.HasKey(e => e.IdVenta).HasName("venta_pkey");

            entity.ToTable("venta");

            entity.Property(e => e.IdVenta).HasColumnName("id_venta");
            entity.Property(e => e.Fecha)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha");
            entity.Property(e => e.IdCliente).HasColumnName("id_cliente");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Observaciones)
                .HasMaxLength(255)
                .HasColumnName("observaciones");
            entity.Property(e => e.TipoVenta)
                .HasMaxLength(20)
                .HasColumnName("tipo_venta");
            entity.Property(e => e.Total)
                .HasPrecision(10, 2)
                .HasColumnName("total");

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("venta_id_cliente_fkey");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("venta_id_usuario_fkey");
        });

        modelBuilder.Entity<VwDisponibilidadToldo>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_disponibilidad_toldos");

            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(150)
                .HasColumnName("descripcion");
            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .HasColumnName("estado");
            entity.Property(e => e.FechaFin).HasColumnName("fecha_fin");
            entity.Property(e => e.FechaInicio).HasColumnName("fecha_inicio");
            entity.Property(e => e.IdAlquiler).HasColumnName("id_alquiler");
            entity.Property(e => e.IdToldo).HasColumnName("id_toldo");
            entity.Property(e => e.Modelo)
                .HasMaxLength(100)
                .HasColumnName("modelo");
            entity.Property(e => e.PrecioAlquiler)
                .HasPrecision(10, 2)
                .HasColumnName("precio_alquiler");
        });

        modelBuilder.Entity<VwVentasCompleta>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ventas_completas");

            entity.Property(e => e.Cliente)
                .HasMaxLength(100)
                .HasColumnName("cliente");
            entity.Property(e => e.ClienteDni)
                .HasMaxLength(20)
                .HasColumnName("cliente_dni");
            entity.Property(e => e.ClienteTelefono)
                .HasMaxLength(20)
                .HasColumnName("cliente_telefono");
            entity.Property(e => e.Fecha)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha");
            entity.Property(e => e.IdVenta).HasColumnName("id_venta");
            entity.Property(e => e.Observaciones)
                .HasMaxLength(255)
                .HasColumnName("observaciones");
            entity.Property(e => e.TipoVenta)
                .HasMaxLength(20)
                .HasColumnName("tipo_venta");
            entity.Property(e => e.Total)
                .HasPrecision(10, 2)
                .HasColumnName("total");
            entity.Property(e => e.Vendedor)
                .HasMaxLength(50)
                .HasColumnName("vendedor");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
