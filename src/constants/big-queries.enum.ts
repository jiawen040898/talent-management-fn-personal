export enum BigQueries {
    GET_MANAGER_STATS_BY_COMPANY = `
        SELECT max(company_id) AS company_id, 
          max(company_name) AS company_name, 
          max(company_is_live) AS company_is_live,
          max(manager_name) AS manager_name, manager_employee_id,
          max(manager_first_name) AS manager_first_name,
          max(manager_user_account_id) AS manager_user_account_id,
          max(manager_email) AS manager_email,
          IFNULL(sum(weekly_action_completed), 0) AS total_action_completed, 
          IFNULL(sum(alltime_action_overdue), 0) AS total_action_overdue, 
          IFNULL(sum(weekly_number_of_new_action_item_created), 0) AS total_new_action,
          IFNULL(sum(weekly_goal_completed), 0) AS total_goal_completed, 
          IFNULL(sum(alltime_goal_overdue), 0) AS total_goal_overdue, 
          IFNULL(sum(weekly_number_of_new_goal_created), 0) AS total_new_goal,
          FROM \`{{project_id}}.product_dept_talent_mgmt{{region_postfix}}.lxp_email_notification\` 
          WHERE company_id IN UNNEST(@company_id)
            AND is_deleted = false
          GROUP BY  manager_employee_id
    `,
    FBC_IS_CLOSED_QUERY = `
        SELECT
          id,
          cycle_close_at
        FROM
          \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle\`
        WHERE
          id = @feedback_cycle_id
          AND status = 'closed'
          AND cycle_close_at IS NOT NULL
         `,
    GET_MANAGER_SUBORDINATES_STATS = `
        SELECT employee_id, 
          name, 
          (IFNULL(alltime_goal_overdue, 0) + IFNULL(alltime_action_overdue, 0)) AS overdue_count, 
          (IFNULL(weekly_number_of_new_goal_created, 0) + IFNULL(weekly_number_of_new_action_item_created, 0)) AS new_count,
          (IFNULL(weekly_goal_completed, 0) + IFNULL(weekly_action_completed, 0)) AS completed_count
          FROM \`{{project_id}}.product_dept_talent_mgmt{{region_postfix}}.lxp_email_notification\`
          WHERE
          company_id = @company_id
            AND manager_employee_id = @manager_employee_id
            AND is_deleted = false
          ORDER BY overdue_count DESC, name ASC
          LIMIT 5
    `,
    CREATE_FBC_SETTING_TABLE = `
        CREATE OR REPLACE TABLE
          \`{{project_id}}.software_eng_dept_talent_mgmt{{region_postfix}}.fbc_setting_{{company_id}}_{{feedback_cycle_id_hash}}\` AS
        SELECT
          setting.company_id,
          setting.feedback_cycle_id,
          setting.feedback_cycle,
          reviewee_info.reviewee_employee_ids,
          setting.questionnaires,
          setting.closed_at,
          CURRENT_TIMESTAMP() AS provisioned_at
        FROM (
          SELECT
            feedback_cycle_id,
            STRUCT ( cycle.name,
              cycle.description,
              SPLIT ( REGEXP_REPLACE(cycle.reviewer_direction, r'[{}]', ''), ',' ) AS perspectives ) AS feedback_cycle,
            cycle.cycle_close_at AS closed_at,
            company_id,
            ARRAY_AGG ( STRUCT ( code,
                title,
                questionnaire.description,
                widget_type,
                order_no,
                inner1.sections ) ) AS questionnaires
          FROM (
            SELECT
              feedback_cycle_id,
              question_code AS code,
              question_title AS title,
              question_description AS description,
              question_widget_type AS widget_type,
              order_no
            FROM
              \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_question\`
            WHERE
              feedback_cycle_id = @feedback_cycle_id
              AND question_widget_type = 'questionnaire' ) questionnaire
          LEFT JOIN (
            SELECT
              questionnaire_code,
              ARRAY_AGG ( STRUCT ( code,
                  title,
                  section.description,
                  widget_type,
                  order_no,
                  inner2.questions ) ) AS sections
            FROM (
              SELECT
                feedback_cycle_id,
                SPLIT(parent_question_code, ':') [SAFE_OFFSET(0)] AS questionnaire_code,
                question_code AS code,
                question_title AS title,
                question_description AS description,
                question_widget_type AS widget_type,
                order_no
              FROM
                \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_question\`
              WHERE
                feedback_cycle_id = @feedback_cycle_id
                AND question_widget_type IN ('competency_section',
                  'general_section') ) section
            LEFT JOIN (
              SELECT
                section_code,
                ARRAY_AGG (STRUCT (code,
                    title,
                    widget_type,
                    order_no)) AS questions
              FROM (
                SELECT
                  feedback_cycle_id,
                  SPLIT(parent_question_code, ':') [SAFE_OFFSET(0)] AS questionnaire_code,
                  SPLIT(parent_question_code, ':') [SAFE_OFFSET(1)] AS section_code,
                  question_code AS code,
                  question_title AS title,
                  question_widget_type AS widget_type,
                  order_no
                FROM
                  \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_question\`
                WHERE
                  feedback_cycle_id = @feedback_cycle_id
                  AND question_widget_type NOT IN ( 'questionnaire',
                    'competency_section',
                    'general_section' ) ) question
              GROUP BY
                section_code ) inner2
            ON
              section.code = inner2.section_code
            GROUP BY
              section.questionnaire_code ) inner1
          ON
            questionnaire.code = inner1.questionnaire_code
          LEFT JOIN (
            SELECT
              id,
              name,
              description,
              reviewer_direction,
              company_id,
              cycle_close_at
            FROM
              \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle\` ) cycle
          ON
            questionnaire.feedback_cycle_id = cycle.id
          GROUP BY
            questionnaire.feedback_cycle_id,
            cycle.company_id,
            cycle.name,
            cycle.description,
            cycle.reviewer_direction,
            cycle.cycle_close_at ) setting
        LEFT JOIN (
          SELECT
            feedback_cycle_id,
            ARRAY_AGG (reviewee_employee_id) AS reviewee_employee_ids
          FROM
            \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_reviewee\` reviewee
          WHERE
            is_deleted = FALSE
          GROUP BY
            feedback_cycle_id ) reviewee_info
        ON
          setting.feedback_cycle_id = reviewee_info.feedback_cycle_id
    `,
    CREATE_FBC_RESULT_TABLE = `
        CREATE OR REPLACE TABLE \`{{project_id}}.software_eng_dept_talent_mgmt{{region_postfix}}.fbc_result_{{company_id}}_{{feedback_cycle_id_hash}}\` AS
          SELECT
            result.feedback_cycle_id,
            cycle.name AS feedback_cycle_name,
            STRUCT(
              result.reviewer_id AS id,
              reviewer.status
            ) AS provider,
            reviewer.perspective,
            STRUCT (
              reviewer.reviewee_id AS id,
              employee_id,
              employee.position,
              employee.department,
              employee.is_manager
            ) AS receiver,
            result.questionnaires,
            cycle.cycle_close_at AS closed_at,
            CURRENT_TIMESTAMP() AS provisioned_at
          FROM
            (
              SELECT
                a1.feedback_cycle_id,
                a1.reviewer_id,
                ARRAY_AGG (
                  STRUCT (
                    a1.questionnaire_code AS code,
                    b1.title,
                    b1.widget_type,
                    b1.order_no,
                    c1.score,
                    c1.max_scale,
                    a1.sections
                  )
                ) AS questionnaires
              FROM
                (
                  SELECT
                    a2.feedback_cycle_id,
                    a2.reviewer_id,
                    b2.questionnaire_code,
                    ARRAY_AGG (
                      STRUCT (
                        a2.section_code AS code,
                        b2.title,
                        b2.widget_type,
                        b2.order_no,
                        c2.score,
                        c2.max_scale,
                        a2.questions
                      )
                    ) AS sections
                  FROM
                    (
                      SELECT
                        a3.feedback_cycle_id,
                        a3.reviewer_id,
                        b3.section_code,
                        ARRAY_AGG (
                          STRUCT (
                            a3.code,
                            b3.title,
                            b3.widget_type,
                            b3.order_no,
                            a3.label,
                            a3.value,
                            a3.score,
                            a3.max_scale
                          )
                        ) AS questions
                      FROM
                        (
                          SELECT
                            feedback_cycle_id,
                            feedback_cycle_reviewer_id AS reviewer_id,
                            question_code AS code,
                            question_widget_type AS widget_type,
                            CAST(JSON_EXTRACT_SCALAR (answer, '$.label') AS STRING) AS label,
                            CAST(JSON_EXTRACT_SCALAR (answer, '$.value') AS STRING) AS value,
                            score,
                            max_scale
                          FROM
                            \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_reviewer_answer\`
                          WHERE
                            feedback_cycle_id = @feedback_cycle_id
                            AND question_widget_type NOT IN (
                              'questionnaire',
                              'competency_section',
                              'general_section'
                            )
                        ) AS a3
                        LEFT JOIN (
                          SELECT
                            section.code AS section_code,
                            question.code,
                            question.title,
                            question.widget_type,
                            question.order_no
                          FROM
                            \`{{project_id}}.software_eng_dept_talent_mgmt{{region_postfix}}.fbc_setting_{{company_id}}_{{feedback_cycle_id_hash}}\` AS fbc_setting,
                            UNNEST (questionnaires) AS questionnaire,
                            UNNEST (questionnaire.sections) AS section,
                            UNNEST (section.questions) AS question
                          WHERE
                            feedback_cycle_id = @feedback_cycle_id
                        ) AS b3 ON a3.code = b3.code
                      GROUP BY
                        a3.feedback_cycle_id,
                        a3.reviewer_id,
                        b3.section_code
                    ) AS a2
                    LEFT JOIN (
                      SELECT
                        questionnaire.code AS questionnaire_code,
                        section.code,
                        section.title,
                        section.widget_type,
                        section.order_no
                      FROM
                        \`{{project_id}}.software_eng_dept_talent_mgmt{{region_postfix}}.fbc_setting_{{company_id}}_{{feedback_cycle_id_hash}}\` AS fbc_setting,
                        UNNEST (questionnaires) AS questionnaire,
                        UNNEST (questionnaire.sections) AS section
                      WHERE
                        feedback_cycle_id = @feedback_cycle_id
                    ) AS b2 ON a2.section_code = b2.code
                    LEFT JOIN (
                      SELECT
                        feedback_cycle_id,
                        feedback_cycle_reviewer_id AS reviewer_id,
                        question_code AS code,
                        question_widget_type AS widget_type,
                        score,
                        max_scale,
                      FROM
                        \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_reviewer_answer\`
                      WHERE
                        feedback_cycle_id = @feedback_cycle_id
                        AND question_widget_type IN ('competency_section', 'general_section')
                    ) AS c2 ON a2.section_code = c2.code
                    AND a2.feedback_cycle_id = c2.feedback_cycle_id
                    AND a2.reviewer_id = c2.reviewer_id
                  GROUP BY
                    a2.feedback_cycle_id,
                    a2.reviewer_id,
                    b2.questionnaire_code
                ) AS a1
                LEFT JOIN (
                  SELECT
                    feedback_cycle_id,
                    questionnaire.code,
                    questionnaire.title,
                    questionnaire.widget_type,
                    questionnaire.order_no
                  FROM
                    \`{{project_id}}.software_eng_dept_talent_mgmt{{region_postfix}}.fbc_setting_{{company_id}}_{{feedback_cycle_id_hash}}\` AS fbc_setting,
                    UNNEST (questionnaires) AS questionnaire
                  WHERE
                    feedback_cycle_id = @feedback_cycle_id
                ) AS b1 ON a1.questionnaire_code = b1.code
                LEFT JOIN (
                  SELECT
                    feedback_cycle_id,
                    feedback_cycle_reviewer_id AS reviewer_id,
                    question_code AS code,
                    question_widget_type AS widget_type,
                    score,
                    max_scale,
                  FROM
                    \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_reviewer_answer\`
                  WHERE
                    feedback_cycle_id = @feedback_cycle_id
                    AND question_widget_type = 'questionnaire'
                ) AS c1 ON a1.questionnaire_code = c1.code
                AND a1.feedback_cycle_id = c1.feedback_cycle_id
                AND a1.reviewer_id = c1.reviewer_id
              GROUP BY
                a1.feedback_cycle_id,
                a1.reviewer_id
            ) AS result
            LEFT JOIN (
              SELECT
                id,
                name,
                cycle_close_at
              FROM
                \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle\`
            ) cycle ON result.feedback_cycle_id = cycle.id
            LEFT JOIN (
              SELECT
                id,
                reviewer_direction AS perspective,
                feedback_cycle_reviewee_id AS reviewee_id,
                status,
                is_deleted
              FROM
                \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_reviewer\`
            ) AS reviewer ON result.reviewer_id = reviewer.id
            LEFT JOIN (
              SELECT
                id,
                reviewee_employee_id AS employee_id,
                is_deleted
              FROM
                \`{{project_id}}.talent_management{{region_postfix}}.feedback_cycle_reviewee\`
            ) AS reviewee ON reviewer.reviewee_id = reviewee.id
            LEFT JOIN (
              SELECT
                id,
                position,
                department,
                is_manager
              FROM
                \`{{project_id}}.talent_management{{region_postfix}}.employee\`
            ) AS employee ON reviewee.employee_id = employee.id
          WHERE reviewee.is_deleted = FALSE
          AND reviewer.is_deleted = FALSE
    `,
}
