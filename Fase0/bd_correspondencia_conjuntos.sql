-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-06-2026 a las 02:49:39
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_correspondencia_conjuntos`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_asignar_conjunto` (IN `p_fk_cod_empresa_vig_conjunto` INT, IN `p_fk_persona_vigilante` INT)   BEGIN
    -- Primero eliminamos cualquier asignación previa de este vigilante
    DELETE FROM empresa_vigilante_conjunto
    WHERE fk_persona_vigilante = p_fk_persona_vigilante;

    -- Insertamos la nueva asignación con el estado correspondiente
    INSERT INTO empresa_vigilante_conjunto (
        fk_cod_empresa_vig_conjunto,
        fk_persona_vigilante,
        fk_estado_vigilante_empresa
    )
    VALUES (
        p_fk_cod_empresa_vig_conjunto,
        p_fk_persona_vigilante,
        1 -- Cambié el 3 por 1 si 'Activo' es 1, verifica este ID en tu tabla estado
    );
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cambiar_apto_residente` (IN `p_cod_apto` INT, IN `p_cod_residente` INT)   BEGIN
    -- 1. Eliminar la vinculación anterior de este residente
    DELETE FROM apto_residente
    WHERE fk_cod_residente = p_cod_residente;

    -- 2. Insertar la nueva vinculación con estado 3 (Pendiente)
    -- Asegúrate de que el ID 3 en tu tabla 'estado' sea efectivamente 'Pendiente'
    INSERT INTO apto_residente (
        fk_cod_apto,
        fk_cod_residente,
        fk_estado_apto_residente
    )
    VALUES (
        p_cod_apto,
        p_cod_residente,
        3
    );

end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sincronizar_roles_usuario` ()   BEGIN
    UPDATE persona p
    SET p.fk_rol = (
        SELECT res.nuevo_rol
        FROM (
            SELECT fk_persona, 1 as nuevo_rol, fecha_actualizacion FROM admin_conjunto WHERE estado = 'Activo'
            UNION ALL
            SELECT fk_persona, 2 as nuevo_rol, fecha_actualizacion FROM propietario_apto WHERE estado = 'Activo'
            UNION ALL
            SELECT fk_persona, 3 as nuevo_rol, fecha_actualizacion FROM residente_apto WHERE estado = 'Activo'
            UNION ALL
            SELECT fk_persona, 4 as nuevo_rol, fecha_actualizacion FROM empresa_vigilante_conjunto WHERE estado = 'Activo'
            UNION ALL
            SELECT fk_persona, 5 as nuevo_rol, fecha_actualizacion FROM empresa_mensajero WHERE estado = 'Activo'
        ) AS res
        WHERE res.fk_persona = p.cod_user
        ORDER BY res.fecha_actualizacion DESC
        LIMIT 1
    )
    WHERE EXISTS (
        SELECT 1 FROM (
            SELECT fk_persona FROM admin_conjunto WHERE estado = 'Activo'
            UNION SELECT fk_persona FROM propietario_apto WHERE estado = 'Activo'
            UNION SELECT fk_persona FROM residente_apto WHERE estado = 'Activo'
            UNION SELECT fk_persona FROM empresa_vigilante_conjunto WHERE estado = 'Activo'
            UNION SELECT fk_persona FROM empresa_mensajero WHERE estado = 'Activo'
        ) AS activos WHERE activos.fk_persona = p.cod_user
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_roles_dinamico` ()   BEGIN
    UPDATE persona p
    SET p.fk_rol = (
        SELECT sub.nuevo_rol
        FROM (
            SELECT fk_cod_administrador AS fk_persona, 1 AS nuevo_rol, fecha_actualizacion FROM admin_conjunto WHERE fk_estado_admin = 1
            UNION ALL
            SELECT fk_cod_propietario AS fk_persona, 2 AS nuevo_rol, fecha_actualizacion FROM apto_propietario WHERE fk_estado_apto_propietario = 1
            UNION ALL
            SELECT fk_cod_residente AS fk_persona, 3 AS nuevo_rol, fecha_actualizacion FROM apto_residente WHERE fk_estado_apto_residente = 1
            UNION ALL
            SELECT fk_persona_vigilante AS fk_persona, 4 AS nuevo_rol, fecha_actualizacion FROM empresa_vigilante_conjunto WHERE fk_estado_vigilante_empresa = 1
            UNION ALL
            SELECT fk_persona_mensajero AS fk_persona, 5 AS nuevo_rol, fecha_actualizacion FROM empresa_mensajero WHERE fk_estado_mensajero = 1
        ) AS sub
        WHERE sub.fk_persona = p.cod_user
        ORDER BY sub.fecha_actualizacion DESC
        LIMIT 1
    )
    WHERE EXISTS (
        SELECT 1 FROM (
            SELECT fk_cod_administrador FROM admin_conjunto WHERE fk_estado_admin = 1
            UNION ALL SELECT fk_cod_propietario FROM apto_propietario WHERE fk_estado_apto_propietario = 1
            UNION ALL SELECT fk_cod_residente FROM apto_residente WHERE fk_estado_apto_residente = 1
            UNION ALL SELECT fk_persona_vigilante FROM empresa_vigilante_conjunto WHERE fk_estado_vigilante_empresa = 1
            UNION ALL SELECT fk_persona_mensajero FROM empresa_mensajero WHERE fk_estado_mensajero = 1
        ) AS activos WHERE activos.fk_cod_administrador = p.cod_user
    );
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_conjunto`
--

CREATE TABLE `admin_conjunto` (
  `cod_admin_conjunto` int(11) NOT NULL,
  `fk_cod_conjunto` int(11) DEFAULT NULL,
  `fk_cod_administrador` int(11) DEFAULT NULL,
  `fk_estado_admin` int(11) DEFAULT 1,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `admin_conjunto`
--

INSERT INTO `admin_conjunto` (`cod_admin_conjunto`, `fk_cod_conjunto`, `fk_cod_administrador`, `fk_estado_admin`, `fecha_actualizacion`, `fecha_registro`) VALUES
(1, 1, 1, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apto`
--

CREATE TABLE `apto` (
  `cod_apto` int(11) NOT NULL,
  `numero_apto` int(11) NOT NULL,
  `fk_cod_torre` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `apto`
--

INSERT INTO `apto` (`cod_apto`, `numero_apto`, `fk_cod_torre`, `fecha_registro`, `fecha_actualizacion`) VALUES
(1, 761, 9, '2026-06-16 02:53:08', '2026-06-16 02:53:08'),
(2, 440, 9, '2026-06-16 02:53:08', '2026-06-16 02:53:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apto_propietario`
--

CREATE TABLE `apto_propietario` (
  `cod_apto_propietario` int(11) NOT NULL,
  `fk_cod_apto` int(11) DEFAULT NULL,
  `fk_cod_propietario` int(11) DEFAULT NULL,
  `fk_estado_apto_propietario` int(11) NOT NULL DEFAULT 1,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `apto_propietario`
--

INSERT INTO `apto_propietario` (`cod_apto_propietario`, `fk_cod_apto`, `fk_cod_propietario`, `fk_estado_apto_propietario`, `fecha_registro`, `fecha_actualizacion`) VALUES
(1, 1, 3, 1, '2026-06-16 02:53:08', '2026-06-16 02:53:08'),
(2, 2, 4, 1, '2026-06-16 02:53:08', '2026-06-16 02:53:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apto_residente`
--

CREATE TABLE `apto_residente` (
  `cod_apto_residente` int(11) NOT NULL,
  `fk_cod_apto` int(11) DEFAULT NULL,
  `fk_cod_residente` int(11) DEFAULT NULL,
  `fk_estado_apto_residente` int(11) NOT NULL DEFAULT 1,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `apto_residente`
--

INSERT INTO `apto_residente` (`cod_apto_residente`, `fk_cod_apto`, `fk_cod_residente`, `fk_estado_apto_residente`, `fecha_actualizacion`, `fecha_registro`) VALUES
(1, 1, 3, 1, '2026-06-16 02:53:08', '2026-06-16 02:53:08'),
(2, 2, 4, 1, '2026-06-16 02:53:08', '2026-06-16 02:53:08'),
(3, 1, 5, 1, '2026-06-16 03:29:15', '2026-06-16 03:29:15'),
(4, 2, 7, 1, '2026-06-16 03:42:00', '2026-06-16 03:42:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conjunto`
--

CREATE TABLE `conjunto` (
  `cod_conjunto` int(11) NOT NULL,
  `nombre_conjunto` varchar(100) DEFAULT NULL,
  `telefono_conjunto` varchar(20) DEFAULT NULL,
  `direccion_conjunto` varchar(20) DEFAULT NULL,
  `ciudad_conjunto` varchar(20) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `conjunto`
--

INSERT INTO `conjunto` (`cod_conjunto`, `nombre_conjunto`, `telefono_conjunto`, `direccion_conjunto`, `ciudad_conjunto`, `fecha_registro`, `fecha_actualizacion`) VALUES
(1, 'Murano', '3213223434', 'Carrera 24 #3A-20', 'Madrid', '2026-06-16 02:34:09', '2026-06-16 02:34:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `cod_empresa` int(11) NOT NULL,
  `nit_empresa` varchar(20) NOT NULL,
  `nombre_empresa` varchar(100) DEFAULT NULL,
  `direccion_empresa` varchar(100) DEFAULT NULL,
  `telefono_empresa` varchar(20) DEFAULT NULL,
  `correo_empresa` varchar(100) DEFAULT NULL,
  `fk_estado_empresa` int(11) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`cod_empresa`, `nit_empresa`, `nombre_empresa`, `direccion_empresa`, `telefono_empresa`, `correo_empresa`, `fk_estado_empresa`, `fecha_registro`, `fecha_actualizacion`) VALUES
(1, '2343444456-5', 'Seguridad Vigilancia', 'cra45 A sur mosquera-cuindinamrca', '3212334545', 'seguridadvigilancia@seguridad.com', 1, '2026-06-16 02:35:46', '2026-06-16 02:35:46'),
(2, '43555654', 'Didi Mensajeria', 'cra45 A sur Bogota', '3213445422', 'didimensajeria@gmail.com', 1, '2026-06-16 03:46:16', '2026-06-16 03:46:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa_mensajero`
--

CREATE TABLE `empresa_mensajero` (
  `cod_empresa_mensajero` int(11) NOT NULL,
  `fk_persona_mensajero` int(11) DEFAULT NULL,
  `fk_empresa_mensajero` int(11) DEFAULT NULL,
  `fk_estado_mensajero` int(11) DEFAULT 1,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresa_mensajero`
--

INSERT INTO `empresa_mensajero` (`cod_empresa_mensajero`, `fk_persona_mensajero`, `fk_empresa_mensajero`, `fk_estado_mensajero`, `fecha_actualizacion`, `fecha_registro`) VALUES
(1, 8, 2, 1, '2026-06-16 03:46:16', '2026-06-16 03:46:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa_seguridad_conjunto`
--

CREATE TABLE `empresa_seguridad_conjunto` (
  `cod_empresa_vig_conjunto` int(11) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fk_cod_conjunto` int(11) DEFAULT NULL,
  `fk_empresa_vig` int(11) DEFAULT NULL,
  `fk_estado_empresa_seguridad_conjunto` int(11) NOT NULL DEFAULT 1,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresa_seguridad_conjunto`
--

INSERT INTO `empresa_seguridad_conjunto` (`cod_empresa_vig_conjunto`, `fecha_registro`, `fk_cod_conjunto`, `fk_empresa_vig`, `fk_estado_empresa_seguridad_conjunto`, `fecha_actualizacion`) VALUES
(1, '2026-06-16 02:35:46', 1, 1, 1, '2026-06-16 02:35:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa_vigilante_conjunto`
--

CREATE TABLE `empresa_vigilante_conjunto` (
  `cod_empresa_vigilante` int(11) NOT NULL,
  `fk_persona_vigilante` int(11) DEFAULT NULL,
  `fk_cod_empresa_vig_conjunto` int(11) DEFAULT NULL,
  `fk_estado_vigilante_empresa` int(11) NOT NULL DEFAULT 1,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresa_vigilante_conjunto`
--

INSERT INTO `empresa_vigilante_conjunto` (`cod_empresa_vigilante`, `fk_persona_vigilante`, `fk_cod_empresa_vig_conjunto`, `fk_estado_vigilante_empresa`, `fecha_actualizacion`, `fecha_registro`) VALUES
(1, 2, 1, 1, '2026-06-16 02:42:42', '2026-06-16 02:42:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `cod_estado` int(11) NOT NULL,
  `nombre_estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`cod_estado`, `nombre_estado`) VALUES
(1, 'Activo'),
(2, 'Inactivo'),
(3, 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_pedido`
--

CREATE TABLE `estado_pedido` (
  `cod_estado_pedido` int(11) NOT NULL,
  `nombre_pedido` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estado_pedido`
--

INSERT INTO `estado_pedido` (`cod_estado_pedido`, `nombre_pedido`) VALUES
(1, '📥 Registrado'),
(2, '📦 Recibido'),
(3, '✅ Confirmado'),
(4, '✍️ Pendiente firma'),
(5, '📬 Entregado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_estado_entrega_residente`
--

CREATE TABLE `pedido_estado_entrega_residente` (
  `cod_pedido_estado_entrega` int(11) NOT NULL,
  `fecha_recibido` datetime DEFAULT NULL,
  `fecha_entregado` datetime DEFAULT NULL,
  `numero_guia` varchar(50) DEFAULT NULL,
  `nombre_pedido` varchar(100) DEFAULT NULL,
  `descripcion_pedido` text DEFAULT NULL,
  `foto_pedido` longtext DEFAULT NULL,
  `fk_estado_pedido` int(11) DEFAULT NULL,
  `fk_cod_vigilante_recibe` int(11) DEFAULT NULL,
  `fk_cod_vigilante_entrega` int(11) DEFAULT NULL,
  `fk_residente` int(11) DEFAULT NULL,
  `fk_mensajero` int(11) DEFAULT NULL,
  `firma_residente` longtext DEFAULT NULL,
  `fk_apto_entrega` int(11) DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pedido_estado_entrega_residente`
--

INSERT INTO `pedido_estado_entrega_residente` (`cod_pedido_estado_entrega`, `fecha_recibido`, `fecha_entregado`, `numero_guia`, `nombre_pedido`, `descripcion_pedido`, `foto_pedido`, `fk_estado_pedido`, `fk_cod_vigilante_recibe`, `fk_cod_vigilante_entrega`, `fk_residente`, `fk_mensajero`, `firma_residente`, `fk_apto_entrega`, `fecha_actualizacion`) VALUES
(1, '2026-06-15 17:53:47', '2026-06-15 17:58:33', '828219191991', 'Caja de respuestos', 'caja respuestos surtidora calle34', 'data:image/jpeg;base64,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', 5, 2, 2, 7, 8, 'data:image/png;base64,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', 2, '2026-06-16 03:47:57');
INSERT INTO `pedido_estado_entrega_residente` (`cod_pedido_estado_entrega`, `fecha_recibido`, `fecha_entregado`, `numero_guia`, `nombre_pedido`, `descripcion_pedido`, `foto_pedido`, `fk_estado_pedido`, `fk_cod_vigilante_recibe`, `fk_cod_vigilante_entrega`, `fk_residente`, `fk_mensajero`, `firma_residente`, `fk_apto_entrega`, `fecha_actualizacion`) VALUES
(2, '2026-06-15 18:50:28', '2026-06-15 19:10:35', 'EEE-2890', 'audifonos mercatronix', 'audifonos mecatronix', 'data:image/jpeg;base64,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', 5, 2, 2, 7, 8, 'data:image/png;base64,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', 2, '2026-06-16 04:31:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `cod_user` int(11) NOT NULL,
  `nombres` varchar(60) NOT NULL,
  `apellidos` varchar(60) NOT NULL,
  `cedula` varchar(15) DEFAULT NULL,
  `correo` varchar(90) DEFAULT NULL,
  `telefono` varchar(50) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `fk_estado_user` int(11) NOT NULL,
  `fk_tipo_doc` int(11) NOT NULL,
  `fk_rol` int(11) NOT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `codigo_recuperacion` varchar(6) DEFAULT NULL,
  `fecha_codigo` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`cod_user`, `nombres`, `apellidos`, `cedula`, `correo`, `telefono`, `usuario`, `contraseña`, `fk_estado_user`, `fk_tipo_doc`, `fk_rol`, `fecha_registro`, `fecha_actualizacion`, `codigo_recuperacion`, `fecha_codigo`) VALUES
(1, 'Juan Camilo', 'Leon Gonzalez', '10876554343', 'adminmurano@gmail.com', '3123443298', 'adminmurano', '$2b$10$rLBio7LTyCVYTbPwGAqEcOwH/qwOp4PW/QOkVE/X/kuk2RxHPMBDO', 1, 1, 1, '2026-06-15 21:32:54', '2026-06-16 02:32:54', NULL, NULL),
(2, 'William Andres', 'Barreto Corzo', '243454555', 'wiliam23@gmail.com', '3213565454', 'vigilante1', '$2b$10$K91w0Vl0KhsC19t/riEaLet4YbmRDrKUeia8fhaZ0lDCALH0ElEze', 1, 2, 4, '2026-06-15 21:42:42', '2026-06-16 02:42:42', NULL, NULL),
(3, 'Hector', 'Forero', '78282929', 'hector@hector.com', '32132233333', '78282929', '$2b$10$UHEP38DfPjENsh.3Vfx1xeL3KzNrD54kOZ9bqv7qpSMpYv50u6Jgq', 1, 1, 2, '2026-06-15 21:53:08', '2026-06-16 02:53:08', NULL, NULL),
(4, 'Liliana', 'Moncada', '34782828', 'llili@gmail.com', '3223445454', '34782828', '$2b$10$yhIB2en.RpdSoZb82HS8Yu55wIMdyo3BIvTucbyS/WIWsnHZ/45t.', 1, 1, 2, '2026-06-15 21:53:08', '2026-06-16 02:53:08', NULL, NULL),
(5, 'Juan Camilo', 'Ochoa Leon', '1014277507', '96camilo@hotmail.es', '3143543471', 'resijuan1', '$2b$10$dRyRiqI8eAZb9zx/isSZq.HjuFm7KGIaXLOnVrTKkFZRIhkDYAwm.', 1, 1, 3, '2026-06-15 22:29:15', '2026-06-16 03:29:15', NULL, NULL),
(7, 'Erica Milena', 'Ochoa Leon', '1014266543', 'mile23@gmail.com', '3212334565', 'resimile2', '$2b$10$W7t/Z/RjrCf3gz8fhjVyQ.VOd0hE26IPS7niGuPx7p4YzDiN/fjPa', 1, 1, 3, '2026-06-15 22:42:00', '2026-06-16 03:42:00', NULL, NULL),
(8, 'Pedro Antonio', 'Aguilar Mejia', '234556554', 'pedrodidid@gmail.com', '3218776565', 'mensajero1', '$2b$10$hVG2ygBrqMIRtySOv0pHI.nj28L7LZheek2ayGgvc4aAnqYTrLsZi', 1, 2, 5, '2026-06-15 22:46:16', '2026-06-16 03:46:16', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `cod_rol` int(11) NOT NULL,
  `nombre_rol` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`cod_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Propietario'),
(3, 'Residente'),
(4, 'Vigilante'),
(5, 'Mensajero'),
(6, 'Superadmin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_doc`
--

CREATE TABLE `tipo_doc` (
  `cod_tipo_doc` int(11) NOT NULL,
  `nombre_tipo_doc` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_doc`
--

INSERT INTO `tipo_doc` (`cod_tipo_doc`, `nombre_tipo_doc`) VALUES
(1, 'CC'),
(2, 'CE'),
(3, 'TI'),
(4, 'PE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `torre`
--

CREATE TABLE `torre` (
  `cod_torre` int(11) NOT NULL,
  `numero_torre` int(11) NOT NULL,
  `fk_cod_conjunto` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `torre`
--

INSERT INTO `torre` (`cod_torre`, `numero_torre`, `fk_cod_conjunto`, `fecha_registro`, `fecha_actualizacion`) VALUES
(2, 2, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(3, 3, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(4, 4, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(5, 5, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(6, 6, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(7, 7, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(8, 8, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(9, 9, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(10, 10, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(11, 11, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(12, 12, 1, '2026-06-16 02:34:09', '2026-06-16 02:34:09'),
(13, 1, 1, '2026-06-16 02:34:17', '2026-06-16 02:34:17');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_historial_pedidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_historial_pedidos` (
`cod_pedido_estado_entrega` int(11)
,`numero_guia` varchar(50)
,`nombre_pedido` varchar(100)
,`descripcion_pedido` text
,`cod_residente` int(11)
,`fecha_recibido` datetime
,`fecha_entregado` datetime
,`estado_pedido` varchar(50)
,`nombre_vigilante_recibe` varchar(60)
,`apellido_vigilante_recibe` varchar(60)
,`nombre_vigilante_entrega` varchar(60)
,`apellido_vigilante_entrega` varchar(60)
,`nombre_residente` varchar(60)
,`apellido_residente` varchar(60)
,`cedula` varchar(15)
,`numero_torre` int(11)
,`numero_apto` int(11)
,`cod_conjunto` int(11)
,`nombre_conjunto` varchar(100)
,`nombre_mensajero` varchar(60)
,`apellido_mensajero` varchar(60)
,`nombre_empresa` varchar(100)
,`firma_residente` longtext
,`foto_pedido` longtext
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0819a925-13d1-4d47-b44c-07932c8a7eec', '2321cecb6639226fbd30086ddbbaa030336460f2fd956229cfb7e5ab7a0dc35b', '2026-05-28 18:47:59.871', '20260528184759_init', NULL, NULL, '2026-05-28 18:47:59.365', 1);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_historial_pedidos`
--
DROP TABLE IF EXISTS `vista_historial_pedidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_historial_pedidos`  AS SELECT `p`.`cod_pedido_estado_entrega` AS `cod_pedido_estado_entrega`, `p`.`numero_guia` AS `numero_guia`, `p`.`nombre_pedido` AS `nombre_pedido`, `p`.`descripcion_pedido` AS `descripcion_pedido`, `p`.`fk_residente` AS `cod_residente`, `p`.`fecha_recibido` AS `fecha_recibido`, `p`.`fecha_entregado` AS `fecha_entregado`, `ep`.`nombre_pedido` AS `estado_pedido`, `vr`.`nombres` AS `nombre_vigilante_recibe`, `vr`.`apellidos` AS `apellido_vigilante_recibe`, `ve`.`nombres` AS `nombre_vigilante_entrega`, `ve`.`apellidos` AS `apellido_vigilante_entrega`, `r`.`nombres` AS `nombre_residente`, `r`.`apellidos` AS `apellido_residente`, `r`.`cedula` AS `cedula`, `t`.`numero_torre` AS `numero_torre`, `a`.`numero_apto` AS `numero_apto`, `c`.`cod_conjunto` AS `cod_conjunto`, `c`.`nombre_conjunto` AS `nombre_conjunto`, `m`.`nombres` AS `nombre_mensajero`, `m`.`apellidos` AS `apellido_mensajero`, `e`.`nombre_empresa` AS `nombre_empresa`, `p`.`firma_residente` AS `firma_residente`, `p`.`foto_pedido` AS `foto_pedido` FROM (((((((((((`pedido_estado_entrega_residente` `p` left join `estado_pedido` `ep` on(`ep`.`cod_estado_pedido` = `p`.`fk_estado_pedido`)) left join `persona` `vr` on(`vr`.`cod_user` = `p`.`fk_cod_vigilante_recibe`)) left join `persona` `ve` on(`ve`.`cod_user` = `p`.`fk_cod_vigilante_entrega`)) left join `persona` `r` on(`r`.`cod_user` = `p`.`fk_residente`)) left join `apto_residente` `ar` on(`ar`.`fk_cod_residente` = `r`.`cod_user`)) left join `apto` `a` on(`a`.`cod_apto` = `ar`.`fk_cod_apto`)) left join `torre` `t` on(`t`.`cod_torre` = `a`.`fk_cod_torre`)) left join `conjunto` `c` on(`c`.`cod_conjunto` = `t`.`fk_cod_conjunto`)) left join `persona` `m` on(`m`.`cod_user` = `p`.`fk_mensajero`)) left join `empresa_mensajero` `em` on(`em`.`fk_persona_mensajero` = `m`.`cod_user`)) left join `empresa` `e` on(`e`.`cod_empresa` = `em`.`fk_empresa_mensajero`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin_conjunto`
--
ALTER TABLE `admin_conjunto`
  ADD PRIMARY KEY (`cod_admin_conjunto`),
  ADD UNIQUE KEY `uq_admin_conjunto` (`fk_cod_conjunto`,`fk_cod_administrador`),
  ADD KEY `admin_conjunto_fk_cod_administrador_fkey` (`fk_cod_administrador`),
  ADD KEY `fk_estado_admin` (`fk_estado_admin`);

--
-- Indices de la tabla `apto`
--
ALTER TABLE `apto`
  ADD PRIMARY KEY (`cod_apto`),
  ADD UNIQUE KEY `uq_apto_torre` (`numero_apto`,`fk_cod_torre`),
  ADD KEY `fk_cod_torre` (`fk_cod_torre`);

--
-- Indices de la tabla `apto_propietario`
--
ALTER TABLE `apto_propietario`
  ADD PRIMARY KEY (`cod_apto_propietario`),
  ADD UNIQUE KEY `uq_apto_propietario` (`fk_cod_apto`,`fk_cod_propietario`),
  ADD KEY `fk_cod_propietario` (`fk_cod_propietario`),
  ADD KEY `fk_estado_apto_propietario` (`fk_estado_apto_propietario`);

--
-- Indices de la tabla `apto_residente`
--
ALTER TABLE `apto_residente`
  ADD PRIMARY KEY (`cod_apto_residente`),
  ADD UNIQUE KEY `uq_apto_residente` (`fk_cod_apto`,`fk_cod_residente`),
  ADD KEY `fk_cod_residente` (`fk_cod_residente`),
  ADD KEY `fk_estado_apto_residente` (`fk_estado_apto_residente`);

--
-- Indices de la tabla `conjunto`
--
ALTER TABLE `conjunto`
  ADD PRIMARY KEY (`cod_conjunto`);

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`cod_empresa`),
  ADD UNIQUE KEY `nit_empresa` (`nit_empresa`),
  ADD KEY `fk_estado_empresa` (`fk_estado_empresa`);

--
-- Indices de la tabla `empresa_mensajero`
--
ALTER TABLE `empresa_mensajero`
  ADD PRIMARY KEY (`cod_empresa_mensajero`),
  ADD KEY `fk_empresa_mensajero` (`fk_empresa_mensajero`),
  ADD KEY `fk_persona_mensajero` (`fk_persona_mensajero`),
  ADD KEY `fk_mensajero_estado_rel` (`fk_estado_mensajero`);

--
-- Indices de la tabla `empresa_seguridad_conjunto`
--
ALTER TABLE `empresa_seguridad_conjunto`
  ADD PRIMARY KEY (`cod_empresa_vig_conjunto`),
  ADD KEY `fk_cod_conjunto` (`fk_cod_conjunto`),
  ADD KEY `fk_empresa_vig` (`fk_empresa_vig`),
  ADD KEY `fk_estado_empresa_seguridad_conjunto` (`fk_estado_empresa_seguridad_conjunto`);

--
-- Indices de la tabla `empresa_vigilante_conjunto`
--
ALTER TABLE `empresa_vigilante_conjunto`
  ADD PRIMARY KEY (`cod_empresa_vigilante`),
  ADD KEY `fk_cod_empresa_vig_conjunto` (`fk_cod_empresa_vig_conjunto`),
  ADD KEY `fk_estado_vigilante_empresa` (`fk_estado_vigilante_empresa`),
  ADD KEY `fk_persona_vigilante` (`fk_persona_vigilante`);

--
-- Indices de la tabla `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`cod_estado`);

--
-- Indices de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  ADD PRIMARY KEY (`cod_estado_pedido`);

--
-- Indices de la tabla `pedido_estado_entrega_residente`
--
ALTER TABLE `pedido_estado_entrega_residente`
  ADD PRIMARY KEY (`cod_pedido_estado_entrega`),
  ADD KEY `fk_cod_vigilante_entrega` (`fk_cod_vigilante_entrega`),
  ADD KEY `fk_cod_vigilante_recibe` (`fk_cod_vigilante_recibe`),
  ADD KEY `fk_estado_pedido` (`fk_estado_pedido`),
  ADD KEY `fk_mensajero` (`fk_mensajero`),
  ADD KEY `fk_residente` (`fk_residente`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`cod_user`),
  ADD UNIQUE KEY `unique_usuario` (`usuario`),
  ADD UNIQUE KEY `unique_cedula_tipo` (`cedula`,`fk_tipo_doc`),
  ADD KEY `fk_estado_user` (`fk_estado_user`),
  ADD KEY `fk_rol` (`fk_rol`),
  ADD KEY `fk_tipo_doc` (`fk_tipo_doc`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`cod_rol`);

--
-- Indices de la tabla `tipo_doc`
--
ALTER TABLE `tipo_doc`
  ADD PRIMARY KEY (`cod_tipo_doc`);

--
-- Indices de la tabla `torre`
--
ALTER TABLE `torre`
  ADD PRIMARY KEY (`cod_torre`),
  ADD KEY `fk_cod_conjunto` (`fk_cod_conjunto`);

--
-- Indices de la tabla `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin_conjunto`
--
ALTER TABLE `admin_conjunto`
  MODIFY `cod_admin_conjunto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `apto`
--
ALTER TABLE `apto`
  MODIFY `cod_apto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `apto_propietario`
--
ALTER TABLE `apto_propietario`
  MODIFY `cod_apto_propietario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `apto_residente`
--
ALTER TABLE `apto_residente`
  MODIFY `cod_apto_residente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `conjunto`
--
ALTER TABLE `conjunto`
  MODIFY `cod_conjunto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `cod_empresa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `empresa_mensajero`
--
ALTER TABLE `empresa_mensajero`
  MODIFY `cod_empresa_mensajero` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `empresa_seguridad_conjunto`
--
ALTER TABLE `empresa_seguridad_conjunto`
  MODIFY `cod_empresa_vig_conjunto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `empresa_vigilante_conjunto`
--
ALTER TABLE `empresa_vigilante_conjunto`
  MODIFY `cod_empresa_vigilante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `cod_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  MODIFY `cod_estado_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pedido_estado_entrega_residente`
--
ALTER TABLE `pedido_estado_entrega_residente`
  MODIFY `cod_pedido_estado_entrega` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `cod_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `cod_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tipo_doc`
--
ALTER TABLE `tipo_doc`
  MODIFY `cod_tipo_doc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `torre`
--
ALTER TABLE `torre`
  MODIFY `cod_torre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admin_conjunto`
--
ALTER TABLE `admin_conjunto`
  ADD CONSTRAINT `admin_conjunto_fk_cod_administrador_fkey` FOREIGN KEY (`fk_cod_administrador`) REFERENCES `persona` (`cod_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `admin_conjunto_fk_cod_conjunto_fkey` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto` (`cod_conjunto`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_estado_admin` FOREIGN KEY (`fk_estado_admin`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `apto`
--
ALTER TABLE `apto`
  ADD CONSTRAINT `apto_ibfk_1` FOREIGN KEY (`fk_cod_torre`) REFERENCES `torre` (`cod_torre`);

--
-- Filtros para la tabla `apto_propietario`
--
ALTER TABLE `apto_propietario`
  ADD CONSTRAINT `apto_propietario_ibfk_1` FOREIGN KEY (`fk_cod_apto`) REFERENCES `apto` (`cod_apto`),
  ADD CONSTRAINT `apto_propietario_ibfk_2` FOREIGN KEY (`fk_cod_propietario`) REFERENCES `persona` (`cod_user`),
  ADD CONSTRAINT `apto_propietario_ibfk_3` FOREIGN KEY (`fk_estado_apto_propietario`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `apto_residente`
--
ALTER TABLE `apto_residente`
  ADD CONSTRAINT `apto_residente_ibfk_1` FOREIGN KEY (`fk_cod_apto`) REFERENCES `apto` (`cod_apto`),
  ADD CONSTRAINT `apto_residente_ibfk_2` FOREIGN KEY (`fk_cod_residente`) REFERENCES `persona` (`cod_user`),
  ADD CONSTRAINT `apto_residente_ibfk_3` FOREIGN KEY (`fk_estado_apto_residente`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD CONSTRAINT `empresa_ibfk_1` FOREIGN KEY (`fk_estado_empresa`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `empresa_mensajero`
--
ALTER TABLE `empresa_mensajero`
  ADD CONSTRAINT `empresa_mensajero_ibfk_1` FOREIGN KEY (`fk_persona_mensajero`) REFERENCES `persona` (`cod_user`),
  ADD CONSTRAINT `empresa_mensajero_ibfk_2` FOREIGN KEY (`fk_empresa_mensajero`) REFERENCES `empresa` (`cod_empresa`),
  ADD CONSTRAINT `fk_mensajero_estado_rel` FOREIGN KEY (`fk_estado_mensajero`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `empresa_seguridad_conjunto`
--
ALTER TABLE `empresa_seguridad_conjunto`
  ADD CONSTRAINT `empresa_seguridad_conjunto_ibfk_1` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto` (`cod_conjunto`),
  ADD CONSTRAINT `empresa_seguridad_conjunto_ibfk_2` FOREIGN KEY (`fk_empresa_vig`) REFERENCES `empresa` (`cod_empresa`),
  ADD CONSTRAINT `empresa_seguridad_conjunto_ibfk_3` FOREIGN KEY (`fk_estado_empresa_seguridad_conjunto`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `empresa_vigilante_conjunto`
--
ALTER TABLE `empresa_vigilante_conjunto`
  ADD CONSTRAINT `empresa_vigilante_conjunto_ibfk_1` FOREIGN KEY (`fk_persona_vigilante`) REFERENCES `persona` (`cod_user`),
  ADD CONSTRAINT `empresa_vigilante_conjunto_ibfk_2` FOREIGN KEY (`fk_cod_empresa_vig_conjunto`) REFERENCES `empresa_seguridad_conjunto` (`cod_empresa_vig_conjunto`),
  ADD CONSTRAINT `empresa_vigilante_conjunto_ibfk_3` FOREIGN KEY (`fk_estado_vigilante_empresa`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `pedido_estado_entrega_residente`
--
ALTER TABLE `pedido_estado_entrega_residente`
  ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_1` FOREIGN KEY (`fk_estado_pedido`) REFERENCES `estado_pedido` (`cod_estado_pedido`),
  ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_2` FOREIGN KEY (`fk_cod_vigilante_recibe`) REFERENCES `persona` (`cod_user`),
  ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_3` FOREIGN KEY (`fk_cod_vigilante_entrega`) REFERENCES `persona` (`cod_user`),
  ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_4` FOREIGN KEY (`fk_residente`) REFERENCES `persona` (`cod_user`),
  ADD CONSTRAINT `pedido_estado_entrega_residente_ibfk_5` FOREIGN KEY (`fk_mensajero`) REFERENCES `persona` (`cod_user`);

--
-- Filtros para la tabla `persona`
--
ALTER TABLE `persona`
  ADD CONSTRAINT `persona_ibfk_1` FOREIGN KEY (`fk_estado_user`) REFERENCES `estado` (`cod_estado`),
  ADD CONSTRAINT `persona_ibfk_2` FOREIGN KEY (`fk_tipo_doc`) REFERENCES `tipo_doc` (`cod_tipo_doc`),
  ADD CONSTRAINT `persona_ibfk_3` FOREIGN KEY (`fk_rol`) REFERENCES `rol` (`cod_rol`);

--
-- Filtros para la tabla `torre`
--
ALTER TABLE `torre`
  ADD CONSTRAINT `torre_fk_cod_conjunto_fkey` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto` (`cod_conjunto`) ON DELETE SET NULL ON UPDATE CASCADE;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `eliminar_residentes_sin_cambio` ON SCHEDULE EVERY 1 DAY STARTS '2026-06-15 19:46:09' ON COMPLETION PRESERVE ENABLE DO BEGIN
    -- Crear tabla temporal para los IDs
    CREATE TEMPORARY TABLE IF NOT EXISTS tmp_borrar_res (id INT);
    TRUNCATE TABLE tmp_borrar_res;

    -- Identificar residentes en estado 3 (Pendiente) que no han sido actualizados
    INSERT INTO tmp_borrar_res (id)
    SELECT ar.fk_cod_residente
    FROM apto_residente ar
    INNER JOIN persona p ON p.cod_user = ar.fk_cod_residente
    WHERE ar.fk_estado_apto_residente = 3
      AND ar.fecha_actualizacion = p.fecha_registro
      AND ar.fecha_actualizacion < NOW() - INTERVAL 1 DAY;

    -- Borrar de la tabla de relación
    DELETE FROM apto_residente
    WHERE fk_cod_residente IN (SELECT id FROM tmp_borrar_res);

    -- Borrar de la tabla persona
    DELETE FROM persona
    WHERE cod_user IN (SELECT id FROM tmp_borrar_res);
    
    DROP TEMPORARY TABLE tmp_borrar_res;
END$$

CREATE DEFINER=`root`@`localhost` EVENT `eliminar_vigilantes_sin_cambio` ON SCHEDULE EVERY 1 DAY STARTS '2026-06-15 19:46:19' ON COMPLETION PRESERVE ENABLE DO BEGIN
    -- Crear tabla temporal para los IDs
    CREATE TEMPORARY TABLE IF NOT EXISTS tmp_borrar_vig (id INT);
    TRUNCATE TABLE tmp_borrar_vig;

    -- Identificar vigilantes en estado 3 (Pendiente) que no han sido actualizados
    INSERT INTO tmp_borrar_vig (id)
    SELECT ar.fk_persona_vigilante
    FROM empresa_vigilante_conjunto ar
    INNER JOIN persona p ON p.cod_user = ar.fk_persona_vigilante
    WHERE ar.fk_estado_vigilante_empresa = 3
      AND ar.fecha_actualizacion = p.fecha_registro
      AND ar.fecha_actualizacion < NOW() - INTERVAL 1 DAY;

    -- Borrar de la tabla de relación
    DELETE FROM empresa_vigilante_conjunto
    WHERE fk_persona_vigilante IN (SELECT id FROM tmp_borrar_vig);

    -- Borrar de la tabla persona
    DELETE FROM persona
    WHERE cod_user IN (SELECT id FROM tmp_borrar_vig);
    
    DROP TEMPORARY TABLE tmp_borrar_vig;
end$$

CREATE DEFINER=`root`@`localhost` EVENT `evt_actualizar_roles_v2` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-06-15 19:46:54' ON COMPLETION NOT PRESERVE ENABLE DO CALL sp_update_roles_dinamico()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
