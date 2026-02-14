-- CreateTable
CREATE TABLE `apto` (
    `cod_apto` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_apto` INTEGER NOT NULL,
    `fk_cod_torre` INTEGER NULL,

    INDEX `fk_cod_torre`(`fk_cod_torre`),
    UNIQUE INDEX `uq_apto_torre`(`numero_apto`, `fk_cod_torre`),
    PRIMARY KEY (`cod_apto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apto_propietario` (
    `cod_apto_propietario` INTEGER NOT NULL AUTO_INCREMENT,
    `fk_cod_apto` INTEGER NULL,
    `fk_cod_propietario` INTEGER NULL,
    `fk_estado_apto_propietario` INTEGER NOT NULL DEFAULT 1,

    INDEX `fk_cod_propietario`(`fk_cod_propietario`),
    INDEX `fk_estado_apto_propietario`(`fk_estado_apto_propietario`),
    UNIQUE INDEX `uq_apto_propietario`(`fk_cod_apto`, `fk_cod_propietario`),
    PRIMARY KEY (`cod_apto_propietario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apto_residente` (
    `cod_apto_residente` INTEGER NOT NULL AUTO_INCREMENT,
    `fk_cod_apto` INTEGER NULL,
    `fk_cod_residente` INTEGER NULL,
    `fk_estado_apto_residente` INTEGER NOT NULL DEFAULT 1,

    INDEX `fk_cod_residente`(`fk_cod_residente`),
    INDEX `fk_estado_apto_residente`(`fk_estado_apto_residente`),
    UNIQUE INDEX `uq_apto_residente`(`fk_cod_apto`, `fk_cod_residente`),
    PRIMARY KEY (`cod_apto_residente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conjunto` (
    `cod_conjunto` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_conjunto` VARCHAR(100) NULL,
    `telefono_conjunto` VARCHAR(20) NULL,

    PRIMARY KEY (`cod_conjunto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa` (
    `cod_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nit_empresa` VARCHAR(20) NOT NULL,
    `nombre_empresa` VARCHAR(100) NULL,
    `direccion_empresa` VARCHAR(100) NULL,
    `telefono_empresa` VARCHAR(20) NULL,
    `correo_empresa` VARCHAR(100) NULL,
    `fk_estado_empresa` INTEGER NOT NULL,

    UNIQUE INDEX `nit_empresa`(`nit_empresa`),
    INDEX `fk_estado_empresa`(`fk_estado_empresa`),
    PRIMARY KEY (`cod_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa_mensajero` (
    `cod_empresa_mensajero` INTEGER NOT NULL AUTO_INCREMENT,
    `fk_persona_mensajero` INTEGER NULL,
    `fk_empresa_mensajero` INTEGER NULL,

    INDEX `fk_empresa_mensajero`(`fk_empresa_mensajero`),
    INDEX `fk_persona_mensajero`(`fk_persona_mensajero`),
    PRIMARY KEY (`cod_empresa_mensajero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa_seguridad_conjunto` (
    `cod_empresa_vig_conjunto` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_registro` DATE NULL,
    `fk_cod_conjunto` INTEGER NULL,
    `fk_empresa_vig` INTEGER NULL,
    `fk_estado_empresa_seguridad_conjunto` INTEGER NOT NULL DEFAULT 1,

    INDEX `fk_cod_conjunto`(`fk_cod_conjunto`),
    INDEX `fk_empresa_vig`(`fk_empresa_vig`),
    INDEX `fk_estado_empresa_seguridad_conjunto`(`fk_estado_empresa_seguridad_conjunto`),
    PRIMARY KEY (`cod_empresa_vig_conjunto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa_vigilante_conjunto` (
    `cod_empresa_vigilante` INTEGER NOT NULL AUTO_INCREMENT,
    `fk_persona_vigilante` INTEGER NULL,
    `fk_cod_empresa_vig_conjunto` INTEGER NULL,
    `fk_estado_vigilante_empresa` INTEGER NOT NULL DEFAULT 1,

    INDEX `fk_cod_empresa_vig_conjunto`(`fk_cod_empresa_vig_conjunto`),
    INDEX `fk_estado_vigilante_empresa`(`fk_estado_vigilante_empresa`),
    INDEX `fk_persona_vigilante`(`fk_persona_vigilante`),
    PRIMARY KEY (`cod_empresa_vigilante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estado` (
    `cod_estado` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_estado` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`cod_estado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estado_pedido` (
    `cod_estado_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_pedido` VARCHAR(50) NULL,

    PRIMARY KEY (`cod_estado_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido_estado_entrega_residente` (
    `cod_pedido_estado_entrega` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_recibido` DATETIME(0) NULL,
    `fecha_entregado` DATETIME(0) NULL,
    `numero_guia` VARCHAR(50) NULL,
    `nombre_pedido` VARCHAR(100) NULL,
    `descripcion_pedido` TEXT NULL,
    `fk_estado_pedido` INTEGER NULL,
    `fk_cod_vigilante_recibe` INTEGER NULL,
    `fk_cod_vigilante_entrega` INTEGER NULL,
    `fk_residente` INTEGER NULL,
    `fk_mensajero` INTEGER NULL,
    `firma_residente` LONGTEXT NULL,
    `fk_apto_entrega` INTEGER NULL,

    INDEX `fk_cod_vigilante_entrega`(`fk_cod_vigilante_entrega`),
    INDEX `fk_cod_vigilante_recibe`(`fk_cod_vigilante_recibe`),
    INDEX `fk_estado_pedido`(`fk_estado_pedido`),
    INDEX `fk_mensajero`(`fk_mensajero`),
    INDEX `fk_residente`(`fk_residente`),
    PRIMARY KEY (`cod_pedido_estado_entrega`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persona` (
    `cod_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(60) NOT NULL,
    `apellidos` VARCHAR(60) NOT NULL,
    `cedula` VARCHAR(15) NULL,
    `correo` VARCHAR(90) NULL,
    `telefono` VARCHAR(50) NOT NULL,
    `usuario` VARCHAR(50) NOT NULL,
    `contraseña` VARCHAR(100) NOT NULL,
    `fk_estado_user` INTEGER NOT NULL,
    `fk_tipo_doc` INTEGER NOT NULL,
    `fk_rol` INTEGER NOT NULL,

    UNIQUE INDEX `unique_cedula`(`cedula`),
    UNIQUE INDEX `unique_usuario`(`usuario`),
    INDEX `fk_estado_user`(`fk_estado_user`),
    INDEX `fk_rol`(`fk_rol`),
    INDEX `fk_tipo_doc`(`fk_tipo_doc`),
    PRIMARY KEY (`cod_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol` (
    `cod_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_rol` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`cod_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_doc` (
    `cod_tipo_doc` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_tipo_doc` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`cod_tipo_doc`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `torre` (
    `cod_torre` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_torre` INTEGER NOT NULL,
    `fk_cod_conjunto` INTEGER NULL,

    INDEX `fk_cod_conjunto`(`fk_cod_conjunto`),
    PRIMARY KEY (`cod_torre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_conjunto` (
    `cod_admin_conjunto` INTEGER NOT NULL AUTO_INCREMENT,
    `fk_cod_conjunto` INTEGER NULL,
    `fk_cod_administrador` INTEGER NULL,

    UNIQUE INDEX `uq_admin_conjunto`(`fk_cod_conjunto`, `fk_cod_administrador`),
    PRIMARY KEY (`cod_admin_conjunto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apto` ADD CONSTRAINT `apto_ibfk_1` FOREIGN KEY (`fk_cod_torre`) REFERENCES `torre`(`cod_torre`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `apto_propietario` ADD CONSTRAINT `apto_propietario_ibfk_1` FOREIGN KEY (`fk_cod_apto`) REFERENCES `apto`(`cod_apto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `apto_propietario` ADD CONSTRAINT `apto_propietario_ibfk_2` FOREIGN KEY (`fk_cod_propietario`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `apto_propietario` ADD CONSTRAINT `apto_propietario_ibfk_3` FOREIGN KEY (`fk_estado_apto_propietario`) REFERENCES `estado`(`cod_estado`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `apto_residente` ADD CONSTRAINT `apto_residente_ibfk_1` FOREIGN KEY (`fk_cod_apto`) REFERENCES `apto`(`cod_apto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `apto_residente` ADD CONSTRAINT `apto_residente_ibfk_2` FOREIGN KEY (`fk_cod_residente`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `apto_residente` ADD CONSTRAINT `apto_residente_ibfk_3` FOREIGN KEY (`fk_estado_apto_residente`) REFERENCES `estado`(`cod_estado`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa` ADD CONSTRAINT `empresa_ibfk_1` FOREIGN KEY (`fk_estado_empresa`) REFERENCES `estado`(`cod_estado`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_mensajero` ADD CONSTRAINT `empresa_mensajero_ibfk_1` FOREIGN KEY (`fk_persona_mensajero`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_mensajero` ADD CONSTRAINT `empresa_mensajero_ibfk_2` FOREIGN KEY (`fk_empresa_mensajero`) REFERENCES `empresa`(`cod_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_seguridad_conjunto` ADD CONSTRAINT `empresa_seguridad_conjunto_ibfk_1` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto`(`cod_conjunto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_seguridad_conjunto` ADD CONSTRAINT `empresa_seguridad_conjunto_ibfk_2` FOREIGN KEY (`fk_empresa_vig`) REFERENCES `empresa`(`cod_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_seguridad_conjunto` ADD CONSTRAINT `empresa_seguridad_conjunto_ibfk_3` FOREIGN KEY (`fk_estado_empresa_seguridad_conjunto`) REFERENCES `estado`(`cod_estado`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_vigilante_conjunto` ADD CONSTRAINT `empresa_vigilante_conjunto_ibfk_1` FOREIGN KEY (`fk_persona_vigilante`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_vigilante_conjunto` ADD CONSTRAINT `empresa_vigilante_conjunto_ibfk_2` FOREIGN KEY (`fk_cod_empresa_vig_conjunto`) REFERENCES `empresa_seguridad_conjunto`(`cod_empresa_vig_conjunto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empresa_vigilante_conjunto` ADD CONSTRAINT `empresa_vigilante_conjunto_ibfk_3` FOREIGN KEY (`fk_estado_vigilante_empresa`) REFERENCES `estado`(`cod_estado`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido_estado_entrega_residente` ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_1` FOREIGN KEY (`fk_estado_pedido`) REFERENCES `estado_pedido`(`cod_estado_pedido`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido_estado_entrega_residente` ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_2` FOREIGN KEY (`fk_cod_vigilante_recibe`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido_estado_entrega_residente` ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_3` FOREIGN KEY (`fk_cod_vigilante_entrega`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido_estado_entrega_residente` ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_4` FOREIGN KEY (`fk_residente`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido_estado_entrega_residente` ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_5` FOREIGN KEY (`fk_mensajero`) REFERENCES `persona`(`cod_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `persona` ADD CONSTRAINT `persona_ibfk_1` FOREIGN KEY (`fk_estado_user`) REFERENCES `estado`(`cod_estado`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `persona` ADD CONSTRAINT `persona_ibfk_2` FOREIGN KEY (`fk_tipo_doc`) REFERENCES `tipo_doc`(`cod_tipo_doc`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `persona` ADD CONSTRAINT `persona_ibfk_3` FOREIGN KEY (`fk_rol`) REFERENCES `rol`(`cod_rol`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `torre` ADD CONSTRAINT `torre_ibfk_1` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto`(`cod_conjunto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `admin_conjunto` ADD CONSTRAINT `admin_conjunto_fk_cod_conjunto_fkey` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto`(`cod_conjunto`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_conjunto` ADD CONSTRAINT `admin_conjunto_fk_cod_administrador_fkey` FOREIGN KEY (`fk_cod_administrador`) REFERENCES `persona`(`cod_user`) ON DELETE SET NULL ON UPDATE CASCADE;
