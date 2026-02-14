-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-11-2025 a las 23:24:35
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
-- Base de datos: `correspondencia_conjuntos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_conjunto`
--

CREATE TABLE `admin_conjunto` (
  `cod_admin_conjunto` int(11) NOT NULL,
  `fk_cod_conjunto` int(11) DEFAULT NULL,
  `fk_cod_administrador` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apto`
--

CREATE TABLE `apto` (
  `cod_apto` int(11) NOT NULL,
  `numero_apto` int(11) NOT NULL,
  `fk_cod_torre` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apto_propietario`
--

CREATE TABLE `apto_propietario` (
  `cod_apto_propietario` int(11) NOT NULL,
  `fk_cod_apto` int(11) DEFAULT NULL,
  `fk_cod_propietario` int(11) DEFAULT NULL,
  `fk_estado_apto_propietario` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apto_residente`
--

CREATE TABLE `apto_residente` (
  `cod_apto_residente` int(11) NOT NULL,
  `fk_cod_apto` int(11) DEFAULT NULL,
  `fk_cod_residente` int(11) DEFAULT NULL,
  `fk_estado_apto_residente` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conjunto`
--

CREATE TABLE `conjunto` (
  `cod_conjunto` int(11) NOT NULL,
  `nombre_conjunto` varchar(100) DEFAULT NULL,
  `telefono_conjunto` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `fk_estado_empresa` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa_mensajero`
--

CREATE TABLE `empresa_mensajero` (
  `cod_empresa_mensajero` int(11) NOT NULL,
  `fk_persona_mensajero` int(11) DEFAULT NULL,
  `fk_empresa_mensajero` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa_seguridad_conjunto`
--

CREATE TABLE `empresa_seguridad_conjunto` (
  `cod_empresa_vig_conjunto` int(11) NOT NULL,
  `fecha_registro` date DEFAULT NULL,
  `fk_cod_conjunto` int(11) DEFAULT NULL,
  `fk_empresa_vig` int(11) DEFAULT NULL,
  `fk_estado_empresa_seguridad_conjunto` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa_vigilante_conjunto`
--

CREATE TABLE `empresa_vigilante_conjunto` (
  `cod_empresa_vigilante` int(11) NOT NULL,
  `fk_persona_vigilante` int(11) DEFAULT NULL,
  `fk_cod_empresa_vig_conjunto` int(11) DEFAULT NULL,
  `fk_estado_vigilante_empresa` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `cod_estado` int(11) NOT NULL,
  `nombre_estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_pedido`
--

CREATE TABLE `estado_pedido` (
  `cod_estado_pedido` int(11) NOT NULL,
  `nombre_pedido` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `pedidos_recibidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `pedidos_recibidos` (
`cod_pedido_estado_entrega` int(11)
,`fecha_recibido` datetime
,`estado` varchar(50)
,`numero_guia` varchar(50)
,`mensajero_empresa` varchar(224)
,`nombre_pedido_descripcion` mediumtext
,`ubicacion_residente` varchar(139)
,`residente` varchar(121)
,`cedula_residente` varchar(15)
,`vigilante_recibio` varchar(121)
,`fk_estado_pedido` int(11)
);

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
  `fk_estado_pedido` int(11) DEFAULT NULL,
  `fk_cod_vigilante_recibe` int(11) DEFAULT NULL,
  `fk_cod_vigilante_entrega` int(11) DEFAULT NULL,
  `fk_residente` int(11) DEFAULT NULL,
  `fk_mensajero` int(11) DEFAULT NULL,
  `firma_residente` longtext DEFAULT NULL,
  `fk_apto_entrega` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `fk_rol` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `cod_rol` int(11) NOT NULL,
  `nombre_rol` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_doc`
--

CREATE TABLE `tipo_doc` (
  `cod_tipo_doc` int(11) NOT NULL,
  `nombre_tipo_doc` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `torre`
--

CREATE TABLE `torre` (
  `cod_torre` int(11) NOT NULL,
  `numero_torre` int(11) NOT NULL,
  `fk_cod_conjunto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_empresas_mensajeros`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_empresas_mensajeros` (
`cod_empresa` int(11)
,`nit_empresa` varchar(20)
,`nombre_empresa` varchar(100)
,`direccion_empresa` varchar(100)
,`telefono_empresa` varchar(20)
,`correo_empresa` varchar(100)
,`nombre_estado` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos` (
`cod_pedido_estado_entrega` int(11)
,`numero_guia` varchar(50)
,`pedido_nombre` varchar(100)
,`pedido_descripcion` text
,`pedido_estado` varchar(50)
,`pedido_fecha_recibido` datetime
,`pedido_fecha_entregado` datetime
,`fk_residente` int(11)
,`pedido_residente` varchar(301)
,`pedido_vigilante_recibe` varchar(233)
,`pedido_vigilante_entrega` varchar(233)
,`pedido_mensajero` varchar(233)
,`firma_residente` longtext
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_propietarios_apartamentos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_propietarios_apartamentos` (
`cod_apto_propietario` int(11)
,`cod_user` int(11)
,`nombres` varchar(60)
,`apellidos` varchar(60)
,`cedula` varchar(15)
,`correo` varchar(90)
,`telefono` varchar(50)
,`numero_apto` int(11)
,`numero_torre` int(11)
,`cod_conjunto` int(11)
,`nombre_conjunto` varchar(100)
,`estado_apto_propietario` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_residentes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_residentes` (
`cod_user` int(11)
,`nombres` varchar(60)
,`apellidos` varchar(60)
,`cedula` varchar(15)
,`correo` varchar(90)
,`telefono` varchar(50)
,`usuario` varchar(50)
,`nombre_tipo_doc` varchar(50)
,`nombre_rol` varchar(20)
,`nombre_estado` varchar(50)
,`numero_apto` int(11)
,`numero_torre` int(11)
,`nombre_conjunto` varchar(100)
,`telefono_conjunto` varchar(20)
,`cod_conjunto` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_residentes_propietario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_residentes_propietario` (
`cod_propietario` int(11)
,`cod_apto` int(11)
,`numero_apto` int(11)
,`numero_torre` int(11)
,`nombre_conjunto` varchar(100)
,`telefono_conjunto` varchar(20)
,`cod_apto_residente` int(11)
,`fk_estado_apto_residente` int(11)
,`estado_apto_residente` varchar(50)
,`cod_residente` int(11)
,`residente_nombres` varchar(60)
,`residente_apellidos` varchar(60)
,`residente_cedula` varchar(15)
,`residente_correo` varchar(90)
,`residente_telefono` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_vigilantes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_vigilantes` (
`cod_vigilante` int(11)
,`nombres` varchar(60)
,`apellidos` varchar(60)
,`cedula` varchar(15)
,`correo` varchar(90)
,`telefono` varchar(50)
,`nombre_empresa` varchar(100)
,`nit_empresa` varchar(20)
,`telefono_empresa` varchar(20)
,`estado_vigilante_empresa` varchar(50)
,`fk_cod_empresa_vig_conjunto` int(11)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `pedidos_recibidos`
--
DROP TABLE IF EXISTS `pedidos_recibidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `pedidos_recibidos`  AS SELECT `p`.`cod_pedido_estado_entrega` AS `cod_pedido_estado_entrega`, `p`.`fecha_recibido` AS `fecha_recibido`, `e`.`nombre_pedido` AS `estado`, `p`.`numero_guia` AS `numero_guia`, concat(`m`.`nombres`,' ',`m`.`apellidos`,' (',`em`.`nombre_empresa`,')') AS `mensajero_empresa`, concat(`p`.`nombre_pedido`,': ',`p`.`descripcion_pedido`) AS `nombre_pedido_descripcion`, concat(`c`.`nombre_conjunto`,' - Torre ',`t`.`numero_torre`,' - Apto ',`a`.`numero_apto`) AS `ubicacion_residente`, concat(`r`.`nombres`,' ',`r`.`apellidos`) AS `residente`, `r`.`cedula` AS `cedula_residente`, concat(`v`.`nombres`,' ',`v`.`apellidos`) AS `vigilante_recibio`, `p`.`fk_estado_pedido` AS `fk_estado_pedido` FROM ((((((((((`pedido_estado_entrega_residente` `p` left join `estado_pedido` `e` on(`p`.`fk_estado_pedido` = `e`.`cod_estado_pedido`)) left join `persona` `m` on(`p`.`fk_mensajero` = `m`.`cod_user`)) left join `empresa_mensajero` `emm` on(`emm`.`fk_persona_mensajero` = `m`.`cod_user`)) left join `empresa` `em` on(`em`.`cod_empresa` = `emm`.`fk_empresa_mensajero`)) left join `persona` `r` on(`p`.`fk_residente` = `r`.`cod_user`)) left join `apto_residente` `ar` on(`ar`.`fk_cod_residente` = `p`.`fk_residente` and `ar`.`fk_estado_apto_residente` = 1)) left join `apto` `a` on(`a`.`cod_apto` = `ar`.`fk_cod_apto`)) left join `torre` `t` on(`a`.`fk_cod_torre` = `t`.`cod_torre`)) left join `conjunto` `c` on(`t`.`fk_cod_conjunto` = `c`.`cod_conjunto`)) left join `persona` `v` on(`p`.`fk_cod_vigilante_recibe` = `v`.`cod_user`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_empresas_mensajeros`
--
DROP TABLE IF EXISTS `vista_empresas_mensajeros`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_empresas_mensajeros`  AS SELECT DISTINCT `e`.`cod_empresa` AS `cod_empresa`, `e`.`nit_empresa` AS `nit_empresa`, `e`.`nombre_empresa` AS `nombre_empresa`, `e`.`direccion_empresa` AS `direccion_empresa`, `e`.`telefono_empresa` AS `telefono_empresa`, `e`.`correo_empresa` AS `correo_empresa`, `es`.`nombre_estado` AS `nombre_estado` FROM ((((`empresa` `e` join `estado` `es` on(`e`.`fk_estado_empresa` = `es`.`cod_estado`)) join `empresa_mensajero` `em` on(`e`.`cod_empresa` = `em`.`fk_empresa_mensajero`)) join `persona` `p` on(`em`.`fk_persona_mensajero` = `p`.`cod_user`)) join `rol` `r` on(`p`.`fk_rol` = `r`.`cod_rol`)) WHERE `r`.`nombre_rol` = 'mensajero' ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos`
--
DROP TABLE IF EXISTS `vista_pedidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos`  AS SELECT `p`.`cod_pedido_estado_entrega` AS `cod_pedido_estado_entrega`, `p`.`numero_guia` AS `numero_guia`, `p`.`nombre_pedido` AS `pedido_nombre`, `p`.`descripcion_pedido` AS `pedido_descripcion`, `ep`.`nombre_pedido` AS `pedido_estado`, `p`.`fecha_recibido` AS `pedido_fecha_recibido`, `p`.`fecha_entregado` AS `pedido_fecha_entregado`, `p`.`fk_residente` AS `fk_residente`, concat(`res`.`nombres`,' ',`res`.`apellidos`,' | Cédula: ',`res`.`cedula`,' | Apto: ',`a`.`numero_apto`,' | Torre: ',`t`.`numero_torre`,' | Conjunto: ',`c`.`nombre_conjunto`) AS `pedido_residente`, concat(`vr`.`nombres`,' ',`vr`.`apellidos`,' | Empresa: ',`ev_recibe`.`nombre_empresa`) AS `pedido_vigilante_recibe`, concat(`ve`.`nombres`,' ',`ve`.`apellidos`,' | Empresa: ',`ev_entrega`.`nombre_empresa`) AS `pedido_vigilante_entrega`, concat(`m`.`nombres`,' ',`m`.`apellidos`,' | Empresa: ',`em`.`nombre_empresa`) AS `pedido_mensajero`, `p`.`firma_residente` AS `firma_residente` FROM (((((((((((((`pedido_estado_entrega_residente` `p` join `persona` `res` on(`p`.`fk_residente` = `res`.`cod_user`)) join `apto_residente` `ar` on(`res`.`cod_user` = `ar`.`fk_cod_residente` and `ar`.`fk_estado_apto_residente` = 1)) join `apto` `a` on(`ar`.`fk_cod_apto` = `a`.`cod_apto`)) join `torre` `t` on(`a`.`fk_cod_torre` = `t`.`cod_torre`)) join `conjunto` `c` on(`t`.`fk_cod_conjunto` = `c`.`cod_conjunto`)) join `estado_pedido` `ep` on(`p`.`fk_estado_pedido` = `ep`.`cod_estado_pedido`)) left join `persona` `vr` on(`p`.`fk_cod_vigilante_recibe` = `vr`.`cod_user`)) left join (select `evc`.`fk_persona_vigilante` AS `fk_persona_vigilante`,`esc`.`fk_cod_conjunto` AS `fk_cod_conjunto`,`e`.`nombre_empresa` AS `nombre_empresa` from ((`empresa_vigilante_conjunto` `evc` join `empresa_seguridad_conjunto` `esc` on(`evc`.`fk_cod_empresa_vig_conjunto` = `esc`.`cod_empresa_vig_conjunto`)) join `empresa` `e` on(`esc`.`fk_empresa_vig` = `e`.`cod_empresa`))) `ev_recibe` on(`vr`.`cod_user` = `ev_recibe`.`fk_persona_vigilante` and `ev_recibe`.`fk_cod_conjunto` = `c`.`cod_conjunto`)) left join `persona` `ve` on(`p`.`fk_cod_vigilante_entrega` = `ve`.`cod_user`)) left join (select `evc`.`fk_persona_vigilante` AS `fk_persona_vigilante`,`esc`.`fk_cod_conjunto` AS `fk_cod_conjunto`,`e`.`nombre_empresa` AS `nombre_empresa` from ((`empresa_vigilante_conjunto` `evc` join `empresa_seguridad_conjunto` `esc` on(`evc`.`fk_cod_empresa_vig_conjunto` = `esc`.`cod_empresa_vig_conjunto`)) join `empresa` `e` on(`esc`.`fk_empresa_vig` = `e`.`cod_empresa`))) `ev_entrega` on(`ve`.`cod_user` = `ev_entrega`.`fk_persona_vigilante` and `ev_entrega`.`fk_cod_conjunto` = `c`.`cod_conjunto`)) left join `persona` `m` on(`p`.`fk_mensajero` = `m`.`cod_user`)) left join `empresa_mensajero` `em_junc` on(`m`.`cod_user` = `em_junc`.`fk_persona_mensajero`)) left join `empresa` `em` on(`em_junc`.`fk_empresa_mensajero` = `em`.`cod_empresa`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_propietarios_apartamentos`
--
DROP TABLE IF EXISTS `vista_propietarios_apartamentos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_propietarios_apartamentos`  AS SELECT `ap`.`cod_apto_propietario` AS `cod_apto_propietario`, `p`.`cod_user` AS `cod_user`, `p`.`nombres` AS `nombres`, `p`.`apellidos` AS `apellidos`, `p`.`cedula` AS `cedula`, `p`.`correo` AS `correo`, `p`.`telefono` AS `telefono`, `a`.`numero_apto` AS `numero_apto`, `t`.`numero_torre` AS `numero_torre`, `c`.`cod_conjunto` AS `cod_conjunto`, `c`.`nombre_conjunto` AS `nombre_conjunto`, `e`.`nombre_estado` AS `estado_apto_propietario` FROM (((((`apto_propietario` `ap` join `persona` `p` on(`ap`.`fk_cod_propietario` = `p`.`cod_user`)) join `apto` `a` on(`ap`.`fk_cod_apto` = `a`.`cod_apto`)) join `torre` `t` on(`a`.`fk_cod_torre` = `t`.`cod_torre`)) join `conjunto` `c` on(`t`.`fk_cod_conjunto` = `c`.`cod_conjunto`)) join `estado` `e` on(`ap`.`fk_estado_apto_propietario` = `e`.`cod_estado`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_residentes`
--
DROP TABLE IF EXISTS `vista_residentes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_residentes`  AS SELECT `p`.`cod_user` AS `cod_user`, `p`.`nombres` AS `nombres`, `p`.`apellidos` AS `apellidos`, `p`.`cedula` AS `cedula`, `p`.`correo` AS `correo`, `p`.`telefono` AS `telefono`, `p`.`usuario` AS `usuario`, `td`.`nombre_tipo_doc` AS `nombre_tipo_doc`, `r`.`nombre_rol` AS `nombre_rol`, `e`.`nombre_estado` AS `nombre_estado`, `a`.`numero_apto` AS `numero_apto`, `t`.`numero_torre` AS `numero_torre`, `c`.`nombre_conjunto` AS `nombre_conjunto`, `c`.`telefono_conjunto` AS `telefono_conjunto`, `c`.`cod_conjunto` AS `cod_conjunto` FROM (((((((`persona` `p` join `apto_residente` `ar` on(`p`.`cod_user` = `ar`.`fk_cod_residente`)) join `apto` `a` on(`ar`.`fk_cod_apto` = `a`.`cod_apto`)) join `torre` `t` on(`a`.`fk_cod_torre` = `t`.`cod_torre`)) join `conjunto` `c` on(`t`.`fk_cod_conjunto` = `c`.`cod_conjunto`)) join `tipo_doc` `td` on(`p`.`fk_tipo_doc` = `td`.`cod_tipo_doc`)) join `rol` `r` on(`p`.`fk_rol` = `r`.`cod_rol`)) join `estado` `e` on(`ar`.`fk_estado_apto_residente` = `e`.`cod_estado`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_residentes_propietario`
--
DROP TABLE IF EXISTS `vista_residentes_propietario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_residentes_propietario`  AS SELECT `pr`.`cod_user` AS `cod_propietario`, `ap`.`cod_apto` AS `cod_apto`, `ap`.`numero_apto` AS `numero_apto`, `tr`.`numero_torre` AS `numero_torre`, `c`.`nombre_conjunto` AS `nombre_conjunto`, `c`.`telefono_conjunto` AS `telefono_conjunto`, `ar`.`cod_apto_residente` AS `cod_apto_residente`, `ar`.`fk_estado_apto_residente` AS `fk_estado_apto_residente`, `e`.`nombre_estado` AS `estado_apto_residente`, `r`.`cod_user` AS `cod_residente`, `r`.`nombres` AS `residente_nombres`, `r`.`apellidos` AS `residente_apellidos`, `r`.`cedula` AS `residente_cedula`, `r`.`correo` AS `residente_correo`, `r`.`telefono` AS `residente_telefono` FROM (((((((`apto_propietario` `apop` join `persona` `pr` on(`pr`.`cod_user` = `apop`.`fk_cod_propietario`)) join `apto` `ap` on(`ap`.`cod_apto` = `apop`.`fk_cod_apto`)) join `torre` `tr` on(`tr`.`cod_torre` = `ap`.`fk_cod_torre`)) join `conjunto` `c` on(`c`.`cod_conjunto` = `tr`.`fk_cod_conjunto`)) join `apto_residente` `ar` on(`ar`.`fk_cod_apto` = `ap`.`cod_apto`)) join `persona` `r` on(`r`.`cod_user` = `ar`.`fk_cod_residente`)) join `estado` `e` on(`e`.`cod_estado` = `ar`.`fk_estado_apto_residente`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_vigilantes`
--
DROP TABLE IF EXISTS `vista_vigilantes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_vigilantes`  AS SELECT `v`.`cod_user` AS `cod_vigilante`, `v`.`nombres` AS `nombres`, `v`.`apellidos` AS `apellidos`, `v`.`cedula` AS `cedula`, `v`.`correo` AS `correo`, `v`.`telefono` AS `telefono`, `e`.`nombre_empresa` AS `nombre_empresa`, `e`.`nit_empresa` AS `nit_empresa`, `e`.`telefono_empresa` AS `telefono_empresa`, `es`.`nombre_estado` AS `estado_vigilante_empresa`, `evc`.`fk_cod_empresa_vig_conjunto` AS `fk_cod_empresa_vig_conjunto` FROM ((((`persona` `v` join `empresa_vigilante_conjunto` `evc` on(`v`.`cod_user` = `evc`.`fk_persona_vigilante`)) join `empresa_seguridad_conjunto` `esc` on(`evc`.`fk_cod_empresa_vig_conjunto` = `esc`.`cod_empresa_vig_conjunto`)) join `empresa` `e` on(`esc`.`fk_empresa_vig` = `e`.`cod_empresa`)) join `estado` `es` on(`evc`.`fk_estado_vigilante_empresa` = `es`.`cod_estado`)) WHERE `v`.`fk_rol` = (select `rol`.`cod_rol` from `rol` where `rol`.`nombre_rol` = 'vigilante' limit 1) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin_conjunto`
--
ALTER TABLE `admin_conjunto`
  ADD PRIMARY KEY (`cod_admin_conjunto`),
  ADD KEY `fk_cod_conjunto` (`fk_cod_conjunto`),
  ADD KEY `fk_cod_administrador` (`fk_cod_administrador`);

--
-- Indices de la tabla `apto`
--
ALTER TABLE `apto`
  ADD PRIMARY KEY (`cod_apto`),
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
  ADD KEY `FK_apto_residente_estado` (`fk_estado_apto_residente`);

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
  ADD KEY `fk_persona_mensajero` (`fk_persona_mensajero`),
  ADD KEY `fk_empresa_mensajero` (`fk_empresa_mensajero`);

--
-- Indices de la tabla `empresa_seguridad_conjunto`
--
ALTER TABLE `empresa_seguridad_conjunto`
  ADD PRIMARY KEY (`cod_empresa_vig_conjunto`),
  ADD KEY `fk_cod_conjunto` (`fk_cod_conjunto`),
  ADD KEY `fk_empresa_vig` (`fk_empresa_vig`),
  ADD KEY `empresa_seguridad_conjunto_ibfk_3` (`fk_estado_empresa_seguridad_conjunto`);

--
-- Indices de la tabla `empresa_vigilante_conjunto`
--
ALTER TABLE `empresa_vigilante_conjunto`
  ADD PRIMARY KEY (`cod_empresa_vigilante`),
  ADD KEY `fk_persona_vigilante` (`fk_persona_vigilante`),
  ADD KEY `fk_cod_empresa_vig_conjunto` (`fk_cod_empresa_vig_conjunto`),
  ADD KEY `fk_estado_vigilante_empresa` (`fk_estado_vigilante_empresa`);

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
  ADD KEY `fk_estado_pedido` (`fk_estado_pedido`),
  ADD KEY `fk_cod_vigilante_recibe` (`fk_cod_vigilante_recibe`),
  ADD KEY `fk_cod_vigilante_entrega` (`fk_cod_vigilante_entrega`),
  ADD KEY `fk_residente` (`fk_residente`),
  ADD KEY `fk_mensajero` (`fk_mensajero`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`cod_user`),
  ADD UNIQUE KEY `unique_cedula` (`cedula`),
  ADD KEY `fk_estado_user` (`fk_estado_user`),
  ADD KEY `fk_tipo_doc` (`fk_tipo_doc`),
  ADD KEY `fk_rol` (`fk_rol`);

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
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin_conjunto`
--
ALTER TABLE `admin_conjunto`
  MODIFY `cod_admin_conjunto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `apto`
--
ALTER TABLE `apto`
  MODIFY `cod_apto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `apto_propietario`
--
ALTER TABLE `apto_propietario`
  MODIFY `cod_apto_propietario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `apto_residente`
--
ALTER TABLE `apto_residente`
  MODIFY `cod_apto_residente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `conjunto`
--
ALTER TABLE `conjunto`
  MODIFY `cod_conjunto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `cod_empresa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresa_mensajero`
--
ALTER TABLE `empresa_mensajero`
  MODIFY `cod_empresa_mensajero` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresa_seguridad_conjunto`
--
ALTER TABLE `empresa_seguridad_conjunto`
  MODIFY `cod_empresa_vig_conjunto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresa_vigilante_conjunto`
--
ALTER TABLE `empresa_vigilante_conjunto`
  MODIFY `cod_empresa_vigilante` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `cod_estado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  MODIFY `cod_estado_pedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido_estado_entrega_residente`
--
ALTER TABLE `pedido_estado_entrega_residente`
  MODIFY `cod_pedido_estado_entrega` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `cod_user` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `cod_rol` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_doc`
--
ALTER TABLE `tipo_doc`
  MODIFY `cod_tipo_doc` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `torre`
--
ALTER TABLE `torre`
  MODIFY `cod_torre` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admin_conjunto`
--
ALTER TABLE `admin_conjunto`
  ADD CONSTRAINT `admin_conjunto_ibfk_1` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto` (`cod_conjunto`),
  ADD CONSTRAINT `admin_conjunto_ibfk_2` FOREIGN KEY (`fk_cod_administrador`) REFERENCES `persona` (`cod_user`);

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
  ADD CONSTRAINT `fk_estado_apto_propietario` FOREIGN KEY (`fk_estado_apto_propietario`) REFERENCES `estado` (`cod_estado`);

--
-- Filtros para la tabla `apto_residente`
--
ALTER TABLE `apto_residente`
  ADD CONSTRAINT `FK_apto_residente_estado` FOREIGN KEY (`fk_estado_apto_residente`) REFERENCES `estado` (`cod_estado`),
  ADD CONSTRAINT `apto_residente_ibfk_1` FOREIGN KEY (`fk_cod_apto`) REFERENCES `apto` (`cod_apto`),
  ADD CONSTRAINT `apto_residente_ibfk_2` FOREIGN KEY (`fk_cod_residente`) REFERENCES `persona` (`cod_user`);

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
  ADD CONSTRAINT `empresa_mensajero_ibfk_2` FOREIGN KEY (`fk_empresa_mensajero`) REFERENCES `empresa` (`cod_empresa`);

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
  ADD CONSTRAINT `fk_estado_vigilante_empresa` FOREIGN KEY (`fk_estado_vigilante_empresa`) REFERENCES `estado` (`cod_estado`);

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
  ADD CONSTRAINT `torre_ibfk_1` FOREIGN KEY (`fk_cod_conjunto`) REFERENCES `conjunto` (`cod_conjunto`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
