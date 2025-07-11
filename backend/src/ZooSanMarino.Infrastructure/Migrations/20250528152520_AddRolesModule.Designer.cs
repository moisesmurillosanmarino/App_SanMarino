﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using ZooSanMarino.Infrastructure.Persistence;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    [DbContext(typeof(ZooSanMarinoContext))]
    [Migration("20250528152520_AddRolesModule")]
    partial class AddRolesModule
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.5")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Company", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Country")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("country");

                    b.Property<string>("CreatedBy")
                        .HasColumnType("text")
                        .HasColumnName("created_by");

                    b.Property<string>("DocumentType")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)")
                        .HasColumnName("document_type");

                    b.Property<DateTime>("LastUpdated")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("last_updated")
                        .HasDefaultValueSql("now()");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text")
                        .HasColumnName("modified_by");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("name");

                    b.Property<string>("Nit")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("nit");

                    b.HasKey("Id")
                        .HasName("pk_companies");

                    b.ToTable("companies", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Departamento", b =>
                {
                    b.Property<int>("DptoPaisId")
                        .HasColumnType("integer")
                        .HasColumnName("dpto_pais_id");

                    b.Property<int>("DptoId")
                        .HasColumnType("integer")
                        .HasColumnName("dpto_id");

                    b.Property<string>("DptoNombre")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("dpto_nombre");

                    b.HasKey("DptoPaisId", "DptoId")
                        .HasName("pk_departamentos");

                    b.ToTable("departamentos", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Farm", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("CompanyId")
                        .HasColumnType("integer")
                        .HasColumnName("company_id");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("name");

                    b.Property<int>("RegionalId")
                        .HasColumnType("integer")
                        .HasColumnName("regional_id");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("status");

                    b.Property<int>("ZoneId")
                        .HasColumnType("integer")
                        .HasColumnName("zone_id");

                    b.HasKey("Id")
                        .HasName("pk_farms");

                    b.HasIndex("CompanyId")
                        .HasDatabaseName("ix_farms_company_id");

                    b.ToTable("farms", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Galpon", b =>
                {
                    b.Property<string>("GalponId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("galpon_id");

                    b.Property<string>("GalponNucleoId")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("galpon_nucleo_id");

                    b.Property<int>("GranjaId")
                        .HasColumnType("integer")
                        .HasColumnName("granja_id");

                    b.HasKey("GalponId")
                        .HasName("pk_galpones");

                    b.HasIndex("GranjaId")
                        .HasDatabaseName("ix_galpones_granja_id");

                    b.HasIndex("GalponNucleoId", "GranjaId")
                        .HasDatabaseName("ix_galpones_galpon_nucleo_id_granja_id");

                    b.ToTable("galpones", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Lote", b =>
                {
                    b.Property<string>("LoteId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("lote_id");

                    b.Property<int?>("AnoTablaGenetica")
                        .HasColumnType("integer")
                        .HasColumnName("ano_tabla_genetica");

                    b.Property<string>("CodigoGuiaGenetica")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("codigo_guia_genetica");

                    b.Property<string>("Fase")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("fase");

                    b.Property<DateTime?>("FechaLlegada")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("fecha_llegada");

                    b.Property<int>("GranjaId")
                        .HasColumnType("integer")
                        .HasColumnName("granja_id");

                    b.Property<string>("Linea")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("linea");

                    b.Property<string>("LoteNombre")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("lote_nombre");

                    b.Property<string>("Raza")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("raza");

                    b.Property<string>("Tecnico")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("tecnico");

                    b.Property<int?>("TotalAvesHembra")
                        .HasColumnType("integer")
                        .HasColumnName("total_aves_hembra");

                    b.Property<int?>("TotalAvesMacho")
                        .HasColumnType("integer")
                        .HasColumnName("total_aves_macho");

                    b.HasKey("LoteId")
                        .HasName("pk_lotes");

                    b.HasIndex("GranjaId")
                        .HasDatabaseName("ix_lotes_granja_id");

                    b.ToTable("lotes", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.LoteGalpon", b =>
                {
                    b.Property<string>("LoteId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("lote_id");

                    b.Property<string>("ReproductoraId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("reproductora_id");

                    b.Property<string>("GalponId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("galpon_id");

                    b.Property<int?>("H")
                        .HasColumnType("integer")
                        .HasColumnName("hembra");

                    b.Property<int?>("M")
                        .HasColumnType("integer")
                        .HasColumnName("macho");

                    b.HasKey("LoteId", "ReproductoraId", "GalponId")
                        .HasName("pk_lote_galpones");

                    b.HasIndex("GalponId")
                        .HasDatabaseName("ix_lote_galpones_galpon_id");

                    b.ToTable("lote_galpones", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.LoteReproductora", b =>
                {
                    b.Property<string>("LoteId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("lote_id");

                    b.Property<string>("ReproductoraId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("reproductora_id");

                    b.Property<DateTime?>("FechaEncasetamiento")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("fecha_encasetamiento");

                    b.Property<int?>("H")
                        .HasColumnType("integer")
                        .HasColumnName("hembra");

                    b.Property<int?>("M")
                        .HasColumnType("integer")
                        .HasColumnName("macho");

                    b.Property<int?>("MortCajaH")
                        .HasColumnType("integer")
                        .HasColumnName("mort_caja_h");

                    b.Property<int?>("MortCajaM")
                        .HasColumnType("integer")
                        .HasColumnName("mort_caja_m");

                    b.Property<string>("NombreLote")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("nombre_lote");

                    b.Property<decimal?>("PesoFinal")
                        .HasColumnType("numeric")
                        .HasColumnName("peso_final");

                    b.Property<decimal?>("PesoInicial")
                        .HasColumnType("numeric")
                        .HasColumnName("peso_inicial");

                    b.Property<int?>("UnifH")
                        .HasColumnType("integer")
                        .HasColumnName("unif_h");

                    b.Property<int?>("UnifM")
                        .HasColumnType("integer")
                        .HasColumnName("unif_m");

                    b.HasKey("LoteId", "ReproductoraId")
                        .HasName("pk_lote_reproductoras");

                    b.ToTable("lote_reproductoras", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.LoteSeguimiento", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<decimal?>("ConsumoAlimento")
                        .HasColumnType("numeric")
                        .HasColumnName("consumo_alimento");

                    b.Property<int?>("ErrorH")
                        .HasColumnType("integer")
                        .HasColumnName("error_h");

                    b.Property<int?>("ErrorM")
                        .HasColumnType("integer")
                        .HasColumnName("error_m");

                    b.Property<DateTime>("Fecha")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("fecha");

                    b.Property<string>("LoteId")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("lote_id");

                    b.Property<int?>("MortalidadH")
                        .HasColumnType("integer")
                        .HasColumnName("mortalidad_h");

                    b.Property<int?>("MortalidadM")
                        .HasColumnType("integer")
                        .HasColumnName("mortalidad_m");

                    b.Property<string>("Observaciones")
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)")
                        .HasColumnName("observaciones");

                    b.Property<decimal?>("PesoFinal")
                        .HasColumnType("numeric")
                        .HasColumnName("peso_final");

                    b.Property<decimal?>("PesoInicial")
                        .HasColumnType("numeric")
                        .HasColumnName("peso_inicial");

                    b.Property<string>("ReproductoraId")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("reproductora_id");

                    b.Property<int?>("SelH")
                        .HasColumnType("integer")
                        .HasColumnName("sel_h");

                    b.Property<int?>("SelM")
                        .HasColumnType("integer")
                        .HasColumnName("sel_m");

                    b.Property<string>("TipoAlimento")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("tipo_alimento");

                    b.HasKey("Id")
                        .HasName("pk_lote_seguimientos");

                    b.HasIndex("LoteId", "ReproductoraId")
                        .HasDatabaseName("ix_lote_seguimientos_lote_id_reproductora_id");

                    b.ToTable("lote_seguimientos", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.MasterList", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Key")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("key");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("name");

                    b.HasKey("Id")
                        .HasName("pk_master_lists");

                    b.HasIndex("Key")
                        .IsUnique()
                        .HasDatabaseName("ix_master_lists_key");

                    b.ToTable("master_lists", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.MasterListOption", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("MasterListId")
                        .HasColumnType("integer")
                        .HasColumnName("master_list_id");

                    b.Property<int>("Order")
                        .HasColumnType("integer")
                        .HasColumnName("order");

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("value");

                    b.HasKey("Id")
                        .HasName("pk_master_list_options");

                    b.HasIndex("MasterListId")
                        .HasDatabaseName("ix_master_list_options_master_list_id");

                    b.ToTable("master_list_options", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Municipio", b =>
                {
                    b.Property<int>("MunPaisId")
                        .HasColumnType("integer")
                        .HasColumnName("mun_pais_id");

                    b.Property<int>("MunDptoId")
                        .HasColumnType("integer")
                        .HasColumnName("mun_dpto_id");

                    b.Property<int>("MunId")
                        .HasColumnType("integer")
                        .HasColumnName("mun_id");

                    b.Property<string>("MunNombre")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("mun_nombre");

                    b.HasKey("MunPaisId", "MunDptoId", "MunId")
                        .HasName("pk_municipios");

                    b.ToTable("municipios", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Nucleo", b =>
                {
                    b.Property<string>("NucleoId")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("nucleo_id");

                    b.Property<int>("GranjaId")
                        .HasColumnType("integer")
                        .HasColumnName("granja_id");

                    b.Property<string>("NucleoNombre")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("nucleo_nombre");

                    b.HasKey("NucleoId", "GranjaId")
                        .HasName("pk_nucleos");

                    b.HasIndex("GranjaId")
                        .HasDatabaseName("ix_nucleos_granja_id");

                    b.ToTable("nucleos", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Pais", b =>
                {
                    b.Property<int>("PaisId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("pais_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("PaisId"));

                    b.Property<string>("PaisNombre")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("pais_nombre");

                    b.HasKey("PaisId")
                        .HasName("pk_paises");

                    b.ToTable("paises", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Regional", b =>
                {
                    b.Property<int>("RegionalCia")
                        .HasColumnType("integer")
                        .HasColumnName("regional_cia");

                    b.Property<int>("RegionalId")
                        .HasColumnType("integer")
                        .HasColumnName("regional_id");

                    b.Property<string>("RegionalCodigo")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)")
                        .HasColumnName("regional_codigo");

                    b.Property<string>("RegionalEstado")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("regional_estado");

                    b.Property<string>("RegionalNombre")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("regional_nombre");

                    b.HasKey("RegionalCia", "RegionalId")
                        .HasName("pk_regionales");

                    b.ToTable("regionales", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Role", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("name");

                    b.PrimitiveCollection<string[]>("Permissions")
                        .IsRequired()
                        .HasColumnType("text[]")
                        .HasColumnName("permissions");

                    b.HasKey("Id")
                        .HasName("pk_roles");

                    b.ToTable("roles", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.RoleCompany", b =>
                {
                    b.Property<int>("RoleId")
                        .HasColumnType("integer")
                        .HasColumnName("role_id");

                    b.Property<int>("CompanyId")
                        .HasColumnType("integer")
                        .HasColumnName("company_id");

                    b.HasKey("RoleId", "CompanyId")
                        .HasName("pk_role_companies");

                    b.HasIndex("CompanyId")
                        .HasDatabaseName("ix_role_companies_company_id");

                    b.ToTable("role_companies", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id")
                        .HasDefaultValueSql("gen_random_uuid()");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at")
                        .HasDefaultValueSql("now()");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("password_hash");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("updated_at");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("username");

                    b.HasKey("Id")
                        .HasName("pk_users");

                    b.HasIndex("Username")
                        .IsUnique()
                        .HasDatabaseName("ix_users_username");

                    b.ToTable("users", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Zona", b =>
                {
                    b.Property<int>("ZonaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("zona_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ZonaId"));

                    b.Property<int>("CompanyId")
                        .HasColumnType("integer")
                        .HasColumnName("company_id");

                    b.Property<int>("ZonaCia")
                        .HasColumnType("integer")
                        .HasColumnName("zona_cia");

                    b.Property<string>("ZonaEstado")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("zona_estado");

                    b.Property<string>("ZonaNombre")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("zona_nombre");

                    b.HasKey("ZonaId")
                        .HasName("pk_zonas");

                    b.HasIndex("CompanyId")
                        .HasDatabaseName("ix_zonas_company_id");

                    b.ToTable("zonas", (string)null);
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Departamento", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Pais", "Pais")
                        .WithMany("Departamentos")
                        .HasForeignKey("DptoPaisId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_departamentos_paises_dpto_pais_id");

                    b.Navigation("Pais");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Farm", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Company", "Company")
                        .WithMany("Farms")
                        .HasForeignKey("CompanyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_farms_companies_company_id");

                    b.Navigation("Company");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Galpon", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Farm", "Farm")
                        .WithMany()
                        .HasForeignKey("GranjaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_galpones_farms_granja_id");

                    b.HasOne("ZooSanMarino.Domain.Entities.Nucleo", "Nucleo")
                        .WithMany("Galpones")
                        .HasForeignKey("GalponNucleoId", "GranjaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_galpones_nucleos_galpon_nucleo_id_granja_id");

                    b.Navigation("Farm");

                    b.Navigation("Nucleo");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Lote", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Farm", "Farm")
                        .WithMany("Lotes")
                        .HasForeignKey("GranjaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_lotes_farms_granja_id");

                    b.Navigation("Farm");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.LoteGalpon", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Galpon", "Galpon")
                        .WithMany()
                        .HasForeignKey("GalponId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired()
                        .HasConstraintName("fk_lote_galpones_galpones_galpon_id");

                    b.HasOne("ZooSanMarino.Domain.Entities.LoteReproductora", "LoteReproductora")
                        .WithMany("LoteGalpones")
                        .HasForeignKey("LoteId", "ReproductoraId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_lote_galpones_lote_reproductoras_lote_id_reproductora_id");

                    b.Navigation("Galpon");

                    b.Navigation("LoteReproductora");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.LoteReproductora", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Lote", "Lote")
                        .WithMany("Reproductoras")
                        .HasForeignKey("LoteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_lote_reproductoras_lotes_lote_id");

                    b.Navigation("Lote");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.LoteSeguimiento", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.LoteReproductora", "LoteReproductora")
                        .WithMany("LoteSeguimientos")
                        .HasForeignKey("LoteId", "ReproductoraId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_lote_seguimientos_lote_reproductoras_lote_id_reproductora_id");

                    b.Navigation("LoteReproductora");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.MasterListOption", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.MasterList", "MasterList")
                        .WithMany("Options")
                        .HasForeignKey("MasterListId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_master_list_options_master_lists_master_list_id");

                    b.Navigation("MasterList");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Municipio", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Departamento", "Departamento")
                        .WithMany("Municipios")
                        .HasForeignKey("MunPaisId", "MunDptoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_municipios_departamentos_mun_pais_id_mun_dpto_id");

                    b.Navigation("Departamento");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Nucleo", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Farm", "Farm")
                        .WithMany("Nucleos")
                        .HasForeignKey("GranjaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_nucleos_farms_granja_id");

                    b.Navigation("Farm");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Regional", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Company", "Company")
                        .WithMany("Regionales")
                        .HasForeignKey("RegionalCia")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_regionales_companies_regional_cia");

                    b.Navigation("Company");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.RoleCompany", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Company", "Company")
                        .WithMany("RoleCompanies")
                        .HasForeignKey("CompanyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_role_companies_companies_company_id");

                    b.HasOne("ZooSanMarino.Domain.Entities.Role", "Role")
                        .WithMany("RoleCompanies")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_role_companies_roles_role_id");

                    b.Navigation("Company");

                    b.Navigation("Role");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Zona", b =>
                {
                    b.HasOne("ZooSanMarino.Domain.Entities.Company", "Company")
                        .WithMany("Zonas")
                        .HasForeignKey("CompanyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_zonas_companies_company_id");

                    b.Navigation("Company");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Company", b =>
                {
                    b.Navigation("Farms");

                    b.Navigation("Regionales");

                    b.Navigation("RoleCompanies");

                    b.Navigation("Zonas");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Departamento", b =>
                {
                    b.Navigation("Municipios");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Farm", b =>
                {
                    b.Navigation("Lotes");

                    b.Navigation("Nucleos");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Lote", b =>
                {
                    b.Navigation("Reproductoras");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.LoteReproductora", b =>
                {
                    b.Navigation("LoteGalpones");

                    b.Navigation("LoteSeguimientos");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.MasterList", b =>
                {
                    b.Navigation("Options");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Nucleo", b =>
                {
                    b.Navigation("Galpones");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Pais", b =>
                {
                    b.Navigation("Departamentos");
                });

            modelBuilder.Entity("ZooSanMarino.Domain.Entities.Role", b =>
                {
                    b.Navigation("RoleCompanies");
                });
#pragma warning restore 612, 618
        }
    }
}
