SELECT
  `p`.`cod_pedido_estado_entrega` AS `cod_pedido_estado_entrega`,
  `p`.`numero_guia` AS `numero_guia`,
  `p`.`nombre_pedido` AS `nombre_pedido`,
  `p`.`descripcion_pedido` AS `descripcion_pedido`,
  `p`.`fk_residente` AS `cod_residente`,
  `p`.`fecha_recibido` AS `fecha_recibido`,
  `p`.`fecha_entregado` AS `fecha_entregado`,
  `ep`.`nombre_pedido` AS `estado_pedido`,
  `vr`.`nombres` AS `nombre_vigilante_recibe`,
  `vr`.`apellidos` AS `apellido_vigilante_recibe`,
  `ve`.`nombres` AS `nombre_vigilante_entrega`,
  `ve`.`apellidos` AS `apellido_vigilante_entrega`,
  `r`.`nombres` AS `nombre_residente`,
  `r`.`apellidos` AS `apellido_residente`,
  `r`.`cedula` AS `cedula`,
  `a`.`numero_apto` AS `numero_apto`,
  `t`.`numero_torre` AS `numero_torre`,
  `c`.`cod_conjunto` AS `cod_conjunto`,
  `c`.`nombre_conjunto` AS `nombre_conjunto`,
  `m`.`nombres` AS `nombre_mensajero`,
  `m`.`apellidos` AS `apellido_mensajero`,
  `e`.`nombre_empresa` AS `nombre_empresa`,
  `p`.`firma_residente` AS `firma_residente`
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  (
                    (
                      `bd_correspondencia_conjuntos`.`pedido_estado_entrega_residente` `p`
                      LEFT JOIN `bd_correspondencia_conjuntos`.`estado_pedido` `ep` ON(
                        `ep`.`cod_estado_pedido` = `p`.`fk_estado_pedido`
                      )
                    )
                    LEFT JOIN `bd_correspondencia_conjuntos`.`persona` `vr` ON(`vr`.`cod_user` = `p`.`fk_cod_vigilante_recibe`)
                  )
                  LEFT JOIN `bd_correspondencia_conjuntos`.`persona` `ve` ON(`ve`.`cod_user` = `p`.`fk_cod_vigilante_entrega`)
                )
                LEFT JOIN `bd_correspondencia_conjuntos`.`persona` `r` ON(`r`.`cod_user` = `p`.`fk_residente`)
              )
              LEFT JOIN `bd_correspondencia_conjuntos`.`apto` `a` ON(`a`.`cod_apto` = `p`.`fk_apto_entrega`)
            )
            LEFT JOIN `bd_correspondencia_conjuntos`.`torre` `t` ON(`t`.`cod_torre` = `a`.`fk_cod_torre`)
          )
          LEFT JOIN `bd_correspondencia_conjuntos`.`conjunto` `c` ON(`c`.`cod_conjunto` = `t`.`fk_cod_conjunto`)
        )
        LEFT JOIN `bd_correspondencia_conjuntos`.`persona` `m` ON(`m`.`cod_user` = `p`.`fk_mensajero`)
      )
      LEFT JOIN `bd_correspondencia_conjuntos`.`empresa_mensajero` `em` ON(`em`.`fk_persona_mensajero` = `m`.`cod_user`)
    )
    LEFT JOIN `bd_correspondencia_conjuntos`.`empresa` `e` ON(`e`.`cod_empresa` = `em`.`fk_empresa_mensajero`)
  )