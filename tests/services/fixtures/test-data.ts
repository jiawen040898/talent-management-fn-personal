import { dateTimeUtil, generatorUtil, MachineTokenRequest } from '@pulsifi/fn';

import {
    ActionSource,
    CompanyStatus,
    EmployeeTaskStatus,
    FeedbackCycleRevieweeRecommendationRecommendationDimension,
    FitModelType,
    FrameworkType,
} from '../../../src/constants';
import {
    CompanyLookupDto,
    IEmployeeUserCreatedEventData,
    ManagerSubordinateAggregatedReportData,
    SubordinatesProgressData,
} from '../../../src/dtos';
import {
    FeedbackRecommendationRequestData,
    FeedbackRecommendationsGenerationEndedRequestEvent,
    RecommendationActionResponseData,
} from '../../../src/interface';
import {
    EmailCommunicationType,
    Employee,
    EmployeeTask,
    FeedbackCycle,
    FeedbackCycleEmailTemplate,
    FeedbackCycleNotification,
    FeedbackCycleReviewee,
    FeedbackCycleReviewer,
    FeedbackCycleStatus,
    LearningGoal,
    ReminderCategory,
    RevieweeStatus,
    ReviewerDirection,
    ReviewerSelectionBy,
    ReviewerSelectSource,
    ReviewerStatus,
    UserAccountStatus,
} from '../../../src/models';
import { AuditDataEntity } from '../../../src/models/audit-data.entity';
import { FeedbackCycleRevieweeRecommendation } from '../../../src/models/feedback-cycle-reviewee-recommendation.entity';
import { testUtil } from '../../setup/test.util';
import { TestData } from '../../setup/test-data.setup';
import {
    testEmployeeBuilder,
    testFeedbackCycleBuilder,
    testFeedbackCycleEmailTemplateBuilder,
    testRevieweeBuilder,
    testRevieweeRecommendationBuilder,
    testReviewerBuilder,
} from './test-builder';

const auditData: AuditDataEntity = {
    created_by: 5,
    updated_by: 5,
};

const employee1: Employee = {
    id: 'ed071ebf-6f7d-47d1-9b0b-52005a5cf778',
    status: UserAccountStatus.ACTIVE,
    company_id: TestData.companyId,
    first_name: 'Jason',
    last_name: 'Lim',
    work_email: 'jasonl@gmail.com',
    ...auditData,
};

const employee2: Employee = {
    id: '7d7c0426-01a6-4577-ab63-83bf2e3c7655',
    status: UserAccountStatus.ACTIVE,
    user_account_id: 13,
    company_id: TestData.companyId,
    first_name: 'Peter',
    last_name: 'Lim',
    work_email: 'peterl@gmail.com',
    ...auditData,
};

const employeeList: Employee[] = [employee1, employee2];

const testEmployeeUserCreatedEventData: IEmployeeUserCreatedEventData = {
    employee_id: employee1.id,
    id: 25,
};

const testEmployeeUserCreatedEventData2: IEmployeeUserCreatedEventData = {
    employee_id: employee2.id,
    id: 26,
};

const mockMachineTokenResponse = {
    data: {
        access_token:
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJKTk5aZThSYl94Y2FaTmlpdmhEYyJ9.eyJpc3MiOiJodHRwczovL3NhbmRib3gtZW50ZXJwcmlzZS1pZC5wdWxzaWZpLm1lLyIsInN1YiI6IllWWUZ2VnF3MEJiak51ZGppME9nbUVvUUNmOEEyR2pyQGNsaWVudHMiLCJhdWQiOiJodHRwczovL3NhbmRib3guYXBpLnB1bHNpZmkubWUvIiwiaWF0IjoxNjY4OTk5MjE2LCJleHAiOjE2NjkwODU2MTYsImF6cCI6IllWWUZ2VnF3MEJiak51ZGppME9nbUVvUUNmOEEyR2pyIiwic2NvcGUiOiJjcmVhdGU6ZW1wbG95ZWVfdXNlcl9hY2NvdW50cyByZWFkOmlkZW50aXR5X3VzZXJzIGRlbGV0ZTppZGVudGl0eV91c2VycyByZWFkOmlkZW50aXR5X2NvbXBhbmllcyB1cGRhdGU6aWRlbnRpdHlfdXNlcnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGU6ZW1wbG95ZWVfdXNlcl9hY2NvdW50cyIsInJlYWQ6aWRlbnRpdHlfdXNlcnMiLCJkZWxldGU6aWRlbnRpdHlfdXNlcnMiLCJyZWFkOmlkZW50aXR5X2NvbXBhbmllcyIsInVwZGF0ZTppZGVudGl0eV91c2VycyJdfQ.z906KnY5UVbW3pETCxAongu6FDfakXv_9zU_oYErap_pbVVUI7kXqXRkrB2R46Av_CCFMg5tWrK3wDOiVG_2kU9myWIB5_ogAZC4CxyyP3KLM9na3InS4qa6dgzIcnyz4laFocKIndisMrGWTmRJGhRBH3wQarv9dlm32AHQHU8MVGmlGwZaPIjmAmBfGfa3DoWYZYVNAILw2cbg5q6QkE7OIx7LNwBVvvcubZazxew3rUhCsYgo7ARcgyPQGS3kW7CtviwuPRbEGELSTvYl82odJf58hANMEne8jggP4gqDLBSEGpPBwK_2r9yq4ALyBjKMxY3a-gS4bHQPfxxCDw',
        scope: 'create:employee_user_accounts read:identity_users delete:identity_users read:identity_companies update:identity_users',
        expires_in: 86400,
        token_type: 'Bearer',
    },
};

const mockAuth0CredentialSecretResponse = {
    AUTH0_ENTERPRISE_M2M_CLIENT_ID: 'xxx',
    AUTH0_ENTERPRISE_M2M_CLIENT_SECRET: 'xxx',
};

const mockCompanyLookupList = {
    data: {
        data: [
            {
                id: 5,
                name: 'Bitcoin Incorporation',
                products: [
                    {
                        module: 'talent_management',
                    },
                    {
                        module: 'talent_acquisition',
                    },
                    {
                        module: 'talent_learning',
                    },
                ],
                timezone: 'Japan',
                locales: [
                    {
                        locale: 'en-US',
                        is_default: true,
                    },
                ],
                is_deleted: false,
                status: 'active',
            },
            {
                id: 1471,
                name: 'Blick, Nikolaus and Kuhn updated',
                products: [
                    {
                        module: 'talent_acquisition',
                    },
                    {
                        module: 'talent_management',
                    },
                ],
                timezone: 'Asia/Kuala_Lumpur',
                locales: [
                    {
                        locale: 'en-US',
                        is_default: true,
                    },
                ],
                is_deleted: true,
                status: 'disabled',
            },
            {
                id: 352,
                name: 'Herman Thiel',
                products: [
                    {
                        module: 'talent_acquisition',
                    },
                    {
                        module: 'talent_management',
                    },
                ],
                timezone: 'Asia/Kuala_Lumpur',
                locales: [
                    {
                        locale: 'en-US',
                        is_default: true,
                    },
                ],
                is_deleted: false,
                status: 'disabled',
            },
        ],
    },
};

const mockMachineTokenRequestPayload: MachineTokenRequest = {
    client_id: 'some_client_id',
    client_secret: 'some_client_secret',
    audience: 'audience',
    grant_type: 'client_credentials',
};

const mockLearningGoal1: Partial<LearningGoal> = {
    title: 'Goal 1',
    description: 'Testing goal 1',
    due_at: new Date('2022-11-23'),
    id: 'ee77a124-54fd-4ed2-9968-ef50c9748630',
    employee_id: employee1.id,
    assigned_source: ActionSource.LEARNER,
    created_by: 1,
    updated_by: 1,
};

const mockLearningGoal2: Partial<LearningGoal> = {
    title: 'Goal 2',
    description: 'Testing goal 2',
    due_at: new Date('2022-11-26'),
    id: '549910d7-c129-4c32-8be0-324f489dcc8f',
    employee_id: employee2.id,
    assigned_source: ActionSource.LEARNER,
    created_by: 1,
    updated_by: 1,
};

const learningGoals = [mockLearningGoal1, mockLearningGoal2];

const mockEmployeeTask1: Partial<EmployeeTask> = {
    goal_id: 'ee77a124-54fd-4ed2-9968-ef50c9748630',
    task_type: 'task',
    title: 'Task 1',
    id: generatorUtil.uuid(),
    employee_id: employee1.id,
    assigned_source: ActionSource.LEARNER,
    created_by: 1,
    updated_by: 1,
    status: EmployeeTaskStatus.IN_PROGRESS,
    started_at: new Date(),
    due_at: new Date('2022-11-23'),
};

const mockEmployeeTask2: Partial<EmployeeTask> = {
    goal_id: '549910d7-c129-4c32-8be0-324f489dcc8f',
    task_type: 'task',
    title: 'Task 1',
    id: generatorUtil.uuid(),
    employee_id: employee2.id,
    assigned_source: ActionSource.LEARNER,
    created_by: 1,
    updated_by: 1,
    status: EmployeeTaskStatus.IN_PROGRESS,
    started_at: new Date(),
    due_at: new Date('2022-11-26'),
};

const employeeTasks = [mockEmployeeTask1, mockEmployeeTask2];

const mockCompanyLookupData: CompanyLookupDto = {
    id: 5,
    is_deleted: false,
    localDate: '2022-11-23',
    locales: [
        {
            is_default: true,
            locale: 'en-US',
        },
    ],
    name: 'Bitcoin Incorporation',
    products: [
        {
            module: 'talent_management',
        },
        {
            module: 'talent_acquisition',
        },
        {
            module: 'talent_learning',
        },
    ],
    status: CompanyStatus.ACTIVE,
    timezone: 'Asia/Tokyo',
};

const mockCompanyLookupDataWithoutModule: CompanyLookupDto = {
    ...mockCompanyLookupData,
    products: [],
};

const mockBQManagerAndStat: ManagerSubordinateAggregatedReportData[] = [
    {
        company_id: 5,
        company_name: 'Bitcoin Incorporation',
        company_is_live: false,
        manager_name: 'Josh Borbon',
        manager_employee_id: 'dd394bf0-5d0d-44ce-adf4-6e500417f645',
        manager_first_name: 'Josh',
        manager_user_account_id: 11973,
        manager_email: 'joshborbon@getnada.com',
        total_action_completed: 16,
        total_action_overdue: 12,
        total_new_action: 9,
        total_goal_completed: 9,
        total_goal_overdue: 6,
        total_new_goal: 14,
    },
    {
        company_id: 5,
        company_name: 'Bitcoin Incorporation',
        company_is_live: false,
        manager_name: 'Jay Manager',
        manager_employee_id: 'c863d0fa-7fc7-4f88-96cd-9d0405224835',
        manager_first_name: 'Jay',
        manager_user_account_id: 13282,
        manager_email: 'greatmanager@getnada.com',
        total_action_completed: 0,
        total_action_overdue: 10,
        total_new_action: 4,
        total_goal_completed: 0,
        total_goal_overdue: 11,
        total_new_goal: 6,
    },
    {
        company_id: 5,
        company_name: 'Bitcoin Incorporation',
        company_is_live: false,
        manager_name: 'Anna Hong',
        manager_employee_id: 'eae5cf89-996c-43e8-b9e2-edd72e989978',
        manager_first_name: 'Anna',
        manager_user_account_id: 12181,
        manager_email: 'pulsifimanager01@getnada.com',
        total_action_completed: 2,
        total_action_overdue: 5,
        total_new_action: 4,
        total_goal_completed: 0,
        total_goal_overdue: 2,
        total_new_goal: 3,
    },
    {
        company_id: 5,
        company_name: 'Bitcoin Incorporation',
        company_is_live: false,
        manager_name: 'Should not be sent',
        manager_employee_id: 'eae5cf89-996c-6677-8888-edd72e989999',
        manager_first_name: 'Should not be sent',
        manager_user_account_id: null,
        manager_email: null,
        total_action_completed: 2,
        total_action_overdue: 5,
        total_new_action: 4,
        total_goal_completed: 0,
        total_goal_overdue: 2,
        total_new_goal: 3,
    },
];

const mockManagerReportData: ManagerSubordinateAggregatedReportData = {
    company_id: 5,
    company_name: 'Bitcoin Incorporation',
    company_is_live: false,
    manager_name: 'Test Invite Employee Multiple',
    manager_employee_id: 'c77021a7-cb4f-466c-9f51-b7cd73eaeecf',
    manager_first_name: 'Test Invite',
    manager_user_account_id: 13861,
    manager_email: 'testemployeemultiplecompany0001@getnada.com',
    total_action_completed: 18,
    total_action_overdue: 16,
    total_new_action: 30,
    total_goal_completed: 6,
    total_goal_overdue: 12,
    total_new_goal: 35,
};

const mockSubordinateSummaries: SubordinatesProgressData[] = [
    {
        employee_id: '7bda5803-31a9-47fb-8402-6c564c99b1a8',
        name: 'camille mah',
        overdue_count: 10,
        new_count: 13,
        completed_count: 5,
    },
    {
        employee_id: '3531b7f2-2c5e-4271-996c-665f2fd9bbc5',
        name: 'Jay Learner 2',
        overdue_count: 8,
        new_count: 0,
        completed_count: 0,
    },
    {
        employee_id: '14e2f87f-144b-4921-9808-dcedec9fcc5d',
        name: 'Mah Yuen Tong Mah',
        overdue_count: 3,
        new_count: 1,
        completed_count: 0,
    },
    {
        employee_id: '0a4ad655-3404-4933-bb7f-7c4249f151d8',
        name: 'Awfiyah Najib',
        overdue_count: 2,
        new_count: 4,
        completed_count: 0,
    },
    {
        employee_id: 'a274e02a-c379-4029-bc62-775ea62ac3d3',
        name: 'Huat Employee Test',
        overdue_count: 2,
        new_count: 36,
        completed_count: 0,
    },
];

const emailContents = [
    {
        subject: 'You are invite to submit self feedback',
        body_in_html: '<p>Hello, this is a feedback self invite </p>',
    },
    {
        subject: 'You are invite to submit other feedback',
        body_in_html: '<p>Hello, this is a feedback reviewer invite </p>',
    },
    {
        subject: 'Please complete your feedback',
        body_in_html: '<p>Hello, this is a feedback reminder </p>',
    },
    {
        subject: 'Please complete feedback for Benny',
        body_in_html: '<p>Hello, this is a feedback reminder for benny </p>',
    },
];

const mockFeedbackCycleReadyForNominationData = testFeedbackCycleBuilder.build({
    status: FeedbackCycleStatus.PENDING,
});
const mockFeedbackCycleReadyForFeedbackData = testFeedbackCycleBuilder.build({
    status: FeedbackCycleStatus.PENDING,
    reviewer_selection_setting: {
        selection_by: ReviewerSelectionBy.ADMIN,
        is_reviewer_selection_approval_enabled: true,
        is_auto_approve_reviewer_selection_enabled: true,
    },
});

const mockFeedbackCycleAutoApprovalData = testFeedbackCycleBuilder.build({
    status: FeedbackCycleStatus.ACTIVE,
    reviewer_selection_setting: {
        selection_by: ReviewerSelectionBy.REVIEWEE,
        is_reviewer_selection_approval_enabled: true,
        is_auto_approve_reviewer_selection_enabled: true,
    },
});

const feedbackSelfInviteEmailTemplate1 =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleReadyForFeedbackData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_REQUESTED,
        ...emailContents[0],
        ...TestData.auditData,
    });
const feedbackReviewerEmailTemplate2 =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleReadyForFeedbackData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_REQUESTED,
        ...emailContents[1],
        ...TestData.auditData,
    });

const feedbackSelfInviteEmailTemplate3 =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleAutoApprovalData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_REQUESTED,
        ...emailContents[0],
        ...TestData.auditData,
    });
const feedbackReviewerEmailTemplate4 =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleAutoApprovalData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_REQUESTED,
        ...emailContents[1],
        ...TestData.auditData,
    });

const employeeReviewee1 = testEmployeeBuilder.build();
const employeeReviewee2 = testEmployeeBuilder.build();
const employeeReviewerPendingNomination1 = testEmployeeBuilder.build();
const employeeReviewerPendingNomination2 = testEmployeeBuilder.build();
const employeeReviewerPendingNomination3 = testEmployeeBuilder.build();
const managerReviewerPendingNomination4 = testEmployeeBuilder.build();
const employeeReviewee3 = testEmployeeBuilder.build();
const employeeReviewerPendingFeedback1 = testEmployeeBuilder.build();
const managerReviewerPendingFeedback2 = testEmployeeBuilder.build();
const managerReviewee4 = testEmployeeBuilder.build();
const employeeReviewee5 = testEmployeeBuilder.build();
const employeeReviewee6 = testEmployeeBuilder.build();
const employeeReviewerPendingApproval1 = testEmployeeBuilder.build();
const employeeReviewerPendingApproval2 = testEmployeeBuilder.build();
const employeeReviewerPendingApproval3 = testEmployeeBuilder.build();
const employeeReviewerPendingApproval4 = testEmployeeBuilder.build();

const reviewee1 = testRevieweeBuilder.build({
    feedback_cycle_id: mockFeedbackCycleReadyForNominationData.id,
    reviewee_employee_id: employeeReviewee1.id,
    reviewer_selection_manager_id: managerReviewerPendingNomination4.id,
});
const reviewee2 = testRevieweeBuilder.build({
    feedback_cycle_id: mockFeedbackCycleReadyForNominationData.id,
    reviewee_employee_id: employeeReviewee2.id,
    reviewer_selection_manager_id: managerReviewerPendingNomination4.id,
});
const reviewee3 = testRevieweeBuilder.build({
    feedback_cycle_id: mockFeedbackCycleReadyForFeedbackData.id,
    reviewee_employee_id: employeeReviewee3.id,
    reviewer_selection_manager_id: managerReviewerPendingFeedback2.id,
});

const reviewee4 = testRevieweeBuilder.build({
    feedback_cycle_id: mockFeedbackCycleAutoApprovalData.id,
    reviewee_employee_id: employeeReviewee5.id,
    reviewer_selection_manager_id: managerReviewee4.id,
    status: RevieweeStatus.PENDING_NOMINATION_APPROVAL,
});

const reviewee5 = testRevieweeBuilder.build({
    feedback_cycle_id: mockFeedbackCycleAutoApprovalData.id,
    reviewee_employee_id: employeeReviewee6.id,
    reviewer_selection_manager_id: managerReviewee4.id,
    status: RevieweeStatus.PENDING_NOMINATION_APPROVAL,
});

const reviewee6 = testRevieweeBuilder.build({
    feedback_cycle_id: mockFeedbackCycleAutoApprovalData.id,
    reviewee_employee_id: employeeReviewee1.id,
    reviewer_selection_manager_id: managerReviewerPendingNomination4.id,
});

const reviewerSelf1 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee1.id,
    reviewer_employee_id: employeeReviewerPendingNomination1.id,
});

const reviewerPeer2 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee1.id,
    reviewer_employee_id: employeeReviewerPendingNomination2.id,
    reviewer_direction: ReviewerDirection.PEER,
});

const reviewerDirectReport3 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee2.id,
    reviewer_employee_id: managerReviewerPendingNomination4.id,
    reviewer_direction: ReviewerDirection.DIRECT_REPORT,
});

const reviewerManager4 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee2.id,
    reviewer_employee_id: managerReviewerPendingNomination4.id,
    reviewer_direction: ReviewerDirection.MANAGER,
});

const reviewerSelf5 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee3.id,
    reviewer_employee_id: employeeReviewerPendingFeedback1.id,
});

const reviewerManager6 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee3.id,
    reviewer_employee_id: managerReviewerPendingFeedback2.id,
    reviewer_direction: ReviewerDirection.MANAGER,
});

const reviewerSelf7 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee4.id,
    reviewer_employee_id: employeeReviewerPendingApproval1.id,
    status: ReviewerStatus.PENDING,
});

const reviewerDirectReport8 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee4.id,
    reviewer_employee_id: employeeReviewerPendingApproval2.id,
    reviewer_direction: ReviewerDirection.DIRECT_REPORT,
    select_source: ReviewerSelectSource.MANAGER,
    status: ReviewerStatus.PENDING,
});

const reviewerPeer9 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee5.id,
    reviewer_employee_id: employeeReviewerPendingApproval3.id,
    reviewer_direction: ReviewerDirection.PEER,
    status: ReviewerStatus.PENDING,
});

const reviewerManager10 = testReviewerBuilder.build({
    feedback_cycle_reviewee_id: reviewee5.id,
    reviewer_employee_id: employeeReviewerPendingApproval4.id,
    reviewer_direction: ReviewerDirection.MANAGER,
    status: ReviewerStatus.PENDING,
});

const entitiesFeedbackCycleActionToBeAdded = [
    {
        entityClass: FeedbackCycle,
        data: [
            mockFeedbackCycleReadyForNominationData,
            mockFeedbackCycleReadyForFeedbackData,
            mockFeedbackCycleAutoApprovalData,
        ],
    },
    {
        entityClass: FeedbackCycleEmailTemplate,
        data: [
            feedbackSelfInviteEmailTemplate1,
            feedbackReviewerEmailTemplate2,
            feedbackSelfInviteEmailTemplate3,
            feedbackReviewerEmailTemplate4,
        ],
    },
    {
        entityClass: Employee,
        data: [
            employeeReviewee1,
            employeeReviewee2,
            employeeReviewee3,
            employeeReviewerPendingNomination1,
            employeeReviewerPendingNomination2,
            employeeReviewerPendingNomination3,
            managerReviewerPendingNomination4,
            employeeReviewerPendingFeedback1,
            managerReviewerPendingFeedback2,
            managerReviewee4,
            employeeReviewee5,
            employeeReviewee6,
            employeeReviewerPendingApproval1,
            employeeReviewerPendingApproval2,
            employeeReviewerPendingApproval3,
            employeeReviewerPendingApproval4,
        ],
    },
    {
        entityClass: FeedbackCycleReviewee,
        data: [reviewee1, reviewee2, reviewee3, reviewee4, reviewee5],
    },
    {
        entityClass: FeedbackCycleReviewer,
        data: [
            reviewerSelf1,
            reviewerPeer2,
            reviewerDirectReport3,
            reviewerManager4,
            reviewerSelf5,
            reviewerManager6,
            reviewerSelf7,
            reviewerDirectReport8,
            reviewerPeer9,
            reviewerManager10,
        ],
    },
];

const mockFeedbackCycleReminderData = testFeedbackCycleBuilder.build({
    id: testUtil.mockUuid(15),
});
const feedbackSelfInviteEmailTemplate =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleReminderData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_REQUESTED,
        ...emailContents[0],
        ...TestData.auditData,
    });
const feedbackReviewerEmailTemplate =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleReminderData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_REQUESTED,
        ...emailContents[1],
        ...TestData.auditData,
    });
const feedbackRevieweeReminderEmailTemplate =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleReminderData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_SUBMISSION_REMINDER,
        ...emailContents[2],
        ...TestData.auditData,
    });
const feedbackReviewerReminderEmailTemplate =
    testFeedbackCycleEmailTemplateBuilder.build({
        feedback_cycle_id: mockFeedbackCycleReminderData.id,
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_SUBMISSION_REMINDER,
        ...emailContents[3],
        ...TestData.auditData,
    });

const reminderNomination: FeedbackCycleNotification = {
    id: 1,
    feedback_cycle_id: mockFeedbackCycleReminderData.id,
    category: ReminderCategory.NOMINATION_SUBMISSION,
    due_before_days: 1,
    due_at: dateTimeUtil.addDays(1, dateTimeUtil.now()),
    ...TestData.auditData,
};
const reminderNominationApproval: FeedbackCycleNotification = {
    id: 2,
    feedback_cycle_id: mockFeedbackCycleReminderData.id,
    category: ReminderCategory.NOMINATION_APPROVAL,
    due_before_days: 1,
    due_at: dateTimeUtil.addDays(4, dateTimeUtil.now()),
    ...TestData.auditData,
};
const reminderFeedbackSubmission: FeedbackCycleNotification = {
    id: 3,
    feedback_cycle_id: mockFeedbackCycleReminderData.id,
    category: ReminderCategory.FEEDBACK_SUBMISSION,
    due_before_days: 1,
    due_at: dateTimeUtil.addDays(7, dateTimeUtil.now()),
    ...TestData.auditData,
};

const employeeNominationSubmission = testEmployeeBuilder.build({
    id: testUtil.mockUuid(1),
});
const employeeNominationApproval = testEmployeeBuilder.build({
    id: testUtil.mockUuid(2),
});
const employeeManagerNominationApproval = testEmployeeBuilder.build({
    id: testUtil.mockUuid(3),
});
const employeeReviewerPending = testEmployeeBuilder.build({
    id: testUtil.mockUuid(4),
});
const employeeReviewerPendingApproval = testEmployeeBuilder.build({
    id: testUtil.mockUuid(5),
});
const employeeReviewerReady = testEmployeeBuilder.build({
    id: testUtil.mockUuid(6),
});
const employeeReviewerPeerReady = testEmployeeBuilder.build({
    id: testUtil.mockUuid(7),
});

const revieweeNominationSubmission = testRevieweeBuilder.build({
    id: testUtil.mockUuid(8),
    feedback_cycle_id: mockFeedbackCycleReminderData.id,
    status: RevieweeStatus.PENDING_NOMINATION,
    reviewee_employee_id: employeeNominationSubmission.id,
    // reviewer_selection_manager_id: revieweeManagerId,
});

const revieweeNominationApproval = testRevieweeBuilder.build({
    id: testUtil.mockUuid(9),
    feedback_cycle_id: mockFeedbackCycleReminderData.id,
    status: RevieweeStatus.PENDING_NOMINATION_APPROVAL,
    reviewee_employee_id: employeeNominationApproval.id,
    reviewer_selection_manager_id: employeeManagerNominationApproval.id,
});

const reviewerPending = testReviewerBuilder.build({
    id: testUtil.mockUuid(10),
    feedback_cycle_reviewee_id: revieweeNominationSubmission.id,
    status: ReviewerStatus.PENDING,
    reviewer_direction: ReviewerDirection.PEER,
    reviewer_employee_id: employeeReviewerPending.id,
    select_source: ReviewerSelectSource.EMPLOYEE,
});

const reviewerPendingApproval = testReviewerBuilder.build({
    id: testUtil.mockUuid(11),
    feedback_cycle_reviewee_id: revieweeNominationApproval.id,
    status: ReviewerStatus.PENDING,
    reviewer_direction: ReviewerDirection.PEER,
    reviewer_employee_id: employeeReviewerPendingApproval.id,
});

const reviewerReady = testReviewerBuilder.build({
    id: testUtil.mockUuid(12),
    feedback_cycle_reviewee_id: revieweeNominationApproval.id,
    status: ReviewerStatus.READY,
    reviewer_direction: ReviewerDirection.SELF,
    reviewer_employee_id: employeeReviewerReady.id,
});

const reviewerPeerReady = testReviewerBuilder.build({
    id: testUtil.mockUuid(13),
    feedback_cycle_reviewee_id: revieweeNominationApproval.id,
    status: ReviewerStatus.READY,
    reviewer_direction: ReviewerDirection.PEER,
    reviewer_employee_id: employeeReviewerPeerReady.id,
});

const externalReviewerReady = testReviewerBuilder.build({
    id: testUtil.mockUuid(14),
    feedback_cycle_reviewee_id: revieweeNominationApproval.id,
    status: ReviewerStatus.READY,
    reviewer_direction: ReviewerDirection.EXTERNAL,
    reviewer_employee_id: null,
    select_source: ReviewerSelectSource.EMPLOYEE,
    external_reviewer_name: 'External 1',
    external_reviewer_email: 'external@yahoo.com',
});

const entitiesFeedbackCycleReminderToBeAdded = [
    {
        entityClass: FeedbackCycle,
        data: [mockFeedbackCycleReminderData],
    },
    {
        entityClass: FeedbackCycleEmailTemplate,
        data: [
            feedbackSelfInviteEmailTemplate,
            feedbackReviewerEmailTemplate,
            feedbackRevieweeReminderEmailTemplate,
            feedbackReviewerReminderEmailTemplate,
        ],
    },
    {
        entityClass: FeedbackCycleNotification,
        data: [
            reminderNomination,
            reminderNominationApproval,
            reminderFeedbackSubmission,
        ],
    },
    {
        entityClass: Employee,
        data: [
            employeeNominationSubmission,
            employeeNominationApproval,
            employeeManagerNominationApproval,
            employeeReviewerPending,
            employeeReviewerReady,
            employeeReviewerPeerReady,
            employeeReviewerPendingApproval,
        ],
    },
    {
        entityClass: FeedbackCycleReviewee,
        data: [revieweeNominationSubmission, revieweeNominationApproval],
    },
    {
        entityClass: FeedbackCycleReviewer,
        data: [
            reviewerPending,
            externalReviewerReady,
            reviewerReady,
            reviewerPeerReady,
            reviewerPendingApproval,
        ],
    },
];

const revieweeRecommendation1 = testRevieweeRecommendationBuilder.build({
    feedback_cycle_id: mockFeedbackCycleAutoApprovalData.id,
    feedback_cycle_reviewee_id: reviewee1.id,
});

const reviewee6Recommendation2 = testRevieweeRecommendationBuilder.build({
    feedback_cycle_id: mockFeedbackCycleAutoApprovalData.id,
    feedback_cycle_reviewee_id: reviewee6.id,
    action: [
        {
            id: '90c0ff1f-d74c-4fe8-a59b-8611a714937a',
            title: 'some title',
            description: 'some description',
        },
    ],
});

const mockFeedbackRecommendationGenerationProcessDataMessage = {
    event_type: 'talent_management_feedback_reviewee_recommendation_requested',
    event_id: 'bc463c4b-c556-4050-b48e-a0d8cce3ebeb',
    company_id: TestData.companyId,
    user_account_id: TestData.companyId,
    data: [
        {
            id: revieweeRecommendation1.id,
            feedback_cycle_reviewee_id: reviewee1.id,
            question_title: 'Critical Thinking',
            question_description:
                'Generates creative ideas and alternative solutions to overcome challenges.',
            recommendation_dimension: 'development',
            score: '5.0000000',
        },
    ],
    timestamp: '2023-10-06T10:58:34.581Z',
};

const mockFeedbackRecommendationGenerationProcessDataBody = {
    Type: 'Notification',
    MessageId: 'aa80a393-3a1e-5a5e-9ebe-fe0ad0849207',
    SequenceNumber: '10000000000000000000',
    TopicArn:
        'arn:aws:sns:ap-southeast-1:434343955077:talent-management-domain-topic.fifo',
    Message: JSON.stringify(
        mockFeedbackRecommendationGenerationProcessDataMessage,
    ),
    Timestamp: '2023-10-06T10:58:34.635Z',
    UnsubscribeURL:
        'https://sns.ap-southeast-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:ap-southeast-1:434343955077:talent-management-domain-topic.fifo:dd32e751-db0b-4176-a57e-0ebefc9ea6c6',
    MessageAttributes: {},
};

const mockFeedbackRecommendationGenerationProcessEvent = {
    Records: [
        {
            body: JSON.stringify(
                mockFeedbackRecommendationGenerationProcessDataBody,
            ),
            attributes: {
                ApproximateReceiveCount: '1',
                SentTimestamp: '1696589914828',
                SequenceNumber: '18881071091905519616',
                MessageGroupId: 'bc463c4b-c556-4050-b48e-a0d8cce3ebeb',
                SenderId: 'AIDA2573QF7UDQNDW3ZZA',
                MessageDeduplicationId:
                    '875dcabcdc11ceba90fa8ab9a8910301cea73d924bbd06180498430323bccaaa',
                ApproximateFirstReceiveTimestamp: '1696589944845',
            },
            messageAttributes: {},
            md5OfBody: 'a4a103d16e1b071b925e24657a034a24',
            eventSource: 'aws:sqs',
            eventSourceARN:
                'arn:aws:sqs:ap-southeast-1:434343955077:talent-management-feedback-recommendation-generation-initialize-queue.fifo',
            awsRegion: 'ap-southeast-1',
        },
    ],
};

const mockFeedbackRecommendationGenerationRequestData: FeedbackRecommendationRequestData =
    {
        id: revieweeRecommendation1.id,
        feedback_cycle_reviewee_id:
            revieweeRecommendation1.feedback_cycle_reviewee_id,
        question_title: 'Critical Thinking',
        question_description:
            'Generates creative ideas and alternative solutions to overcome challenges.',
        recommendation_dimension:
            FeedbackCycleRevieweeRecommendationRecommendationDimension.DEVELOPMENT,
        score: 5,
    };

const mockFeedbackRecommendationGenerationEndedEvent: FeedbackRecommendationsGenerationEndedRequestEvent =
    {
        data: [
            {
                id: reviewee6Recommendation2.id,
                feedback_cycle_reviewee_id: reviewee6.id,
            },
        ],
        feedback_cycle_reviewee_id: reviewee6.id,
    };

const mockRecommendationActionResponse: RecommendationActionResponseData = {
    data: [
        {
            action: 'some action',
            explanation: 'some explanation',
        },
    ],
};
const mockRecommendationResourceResponse = {
    books: [
        {
            title: 'some title',
            subtitle: 'some subtitle',
            authors: ['some author'],
            info_url: 'www.info.url',
            image_url: 'www.image.url',
        },
    ],
    courses: [
        {
            title: 'some title',
            subtitle: 'some subtitle',
            authors: ['some author'],
            info_url: 'www.info.url',
            image_url: 'www.image.url',
        },
    ],
};

const ingredientsAndAttributeTest1 = {
    weightage: 0.2,
    ingredient_attribute: null,
};

const ingredientsAndAttributeTest2 = {
    weightage: 0.2,
    ingredient_attribute: null,
};

const ingredientsAndAttributeTest3 = {
    weightage: 0.1428571,
    ingredient_attribute: null,
};

const ingredientsAndAttributeTest4 = {
    weightage: 0.125,
    ingredient_attribute: null,
    ingredient_framework: null,
    ingredient_group: 'recipe',
};

const ingredientsAndAttributeTest5 = {
    weightage: 0.33333,
    ingredient_attribute: null,
    ingredient_framework: null,
};

const resultsDrivenAndWorkValue = {
    ingredient_group: 'results_driven',
    ingredient_framework: 'work_value',
};

const resultsDrivenAndWorkStyle = {
    ingredient_group: 'results_driven',
    ingredient_framework: 'work_style',
};

const inSyncAndWorkStyle = {
    ingredient_group: 'in_sync',
    ingredient_framework: 'work_style',
};

const stakeholderSavvyWorkStyle = {
    ingredient_group: 'stakeholder_savvy',
    ingredient_framework: 'work_style',
};

const learningAndWorkStyle = {
    ingredient_group: 'learning',
    ingredient_framework: 'work_style',
};

const ownershipAndWorkValue = {
    ingredient_group: 'ownership',
    ingredient_framework: 'work_value',
};

const ownershipAndWorkStyle = {
    ingredient_group: 'ownership',
    ingredient_framework: 'work_style',
};

const peopleCentricAndWorkStyle = {
    ingredient_group: 'people_centric',
    ingredient_framework: 'work_style',
};

const peopleCentricAndWorkInterest = {
    ingredient_group: 'people_centric',
    ingredient_framework: 'work_interest',
};

const avantGardeAndWorkStyle = {
    ingredient_group: 'avant_garde',
    ingredient_framework: 'work_style',
};

const avantGardeAndWorkValue = {
    ingredient_group: 'avant_garde',
    ingredient_framework: 'work_value',
};

const cultureFitRecipe = [
    {
        ingredient_alias: 'social',
        ...ingredientsAndAttributeTest1,
        ...peopleCentricAndWorkInterest,
    },
    {
        ...peopleCentricAndWorkInterest,
        ingredient_alias: 'support',
        ...ingredientsAndAttributeTest1,
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'cooperation',
        ...ingredientsAndAttributeTest1,
        ...peopleCentricAndWorkStyle,
    },
    {
        ingredient_alias: 'concern_for_others',
        ...ingredientsAndAttributeTest1,
        ...peopleCentricAndWorkStyle,
    },
    {
        ingredient_alias: 'social_orientation',
        ...ingredientsAndAttributeTest1,
        ...peopleCentricAndWorkStyle,
    },
    {
        ...ownershipAndWorkValue,
        ingredient_alias: 'investigative',
        ...ingredientsAndAttributeTest1,
        ingredient_framework: 'work_interest',
    },
    {
        ingredient_alias: 'independence',
        ...ingredientsAndAttributeTest1,
        ...ownershipAndWorkValue,
    },
    {
        ingredient_alias: 'relationships',
        ...ingredientsAndAttributeTest1,
        ...ownershipAndWorkValue,
    },
    {
        ingredient_alias: 'leadership',
        ...ingredientsAndAttributeTest1,
        ...ownershipAndWorkStyle,
    },
    {
        ingredient_alias: 'integrity',
        ...ingredientsAndAttributeTest1,
        ...ownershipAndWorkStyle,
    },
    {
        ...learningAndWorkStyle,
        ingredient_alias: 'working_conditions',
        ...ingredientsAndAttributeTest2,
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'achievement_effort',
        ...ingredientsAndAttributeTest2,
        ...learningAndWorkStyle,
    },
    {
        ingredient_alias: 'initiative',
        ...ingredientsAndAttributeTest2,
        ...learningAndWorkStyle,
    },
    {
        ingredient_alias: 'independence',
        ...ingredientsAndAttributeTest2,
        ...learningAndWorkStyle,
    },
    {
        ...avantGardeAndWorkValue,
        ingredient_alias: 'realistic',
        ...ingredientsAndAttributeTest3,
        ingredient_framework: 'work_interest',
    },
    {
        ...avantGardeAndWorkValue,
        ingredient_alias: 'reasoning_logical',
        ...ingredientsAndAttributeTest3,
        ingredient_framework: null,
    },
    {
        ingredient_alias: 'independence',
        ...ingredientsAndAttributeTest3,
        ...avantGardeAndWorkValue,
    },
    {
        ingredient_alias: 'working_conditions',
        ...ingredientsAndAttributeTest3,
        ...avantGardeAndWorkValue,
    },
    {
        ingredient_alias: 'adaptability_flexibility',
        ...ingredientsAndAttributeTest3,
        ...avantGardeAndWorkStyle,
    },
    {
        ingredient_alias: 'innovation',
        ...ingredientsAndAttributeTest3,
        ...avantGardeAndWorkStyle,
    },
    {
        ingredient_alias: 'analytical_thinking',
        ...ingredientsAndAttributeTest3,
        ...avantGardeAndWorkStyle,
    },
    {
        ingredient_alias: 'achievement',
        ...ingredientsAndAttributeTest1,
        ...resultsDrivenAndWorkValue,
    },
    {
        ingredient_alias: 'recognition',
        ...ingredientsAndAttributeTest1,
        ...resultsDrivenAndWorkValue,
    },
    {
        ingredient_alias: 'achievement_effort',
        ...ingredientsAndAttributeTest1,
        ...resultsDrivenAndWorkStyle,
    },
    {
        ingredient_alias: 'persistence',
        ...ingredientsAndAttributeTest1,
        ...resultsDrivenAndWorkStyle,
    },
    {
        ingredient_alias: 'dependability',
        ...ingredientsAndAttributeTest1,
        ...resultsDrivenAndWorkStyle,
    },
    {
        ingredient_group: 'in_sync',
        ingredient_alias: 'support',
        ...ingredientsAndAttributeTest2,
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'concern_for_others',
        ...ingredientsAndAttributeTest2,
        ...inSyncAndWorkStyle,
    },
    {
        ingredient_alias: 'self_control',
        ...ingredientsAndAttributeTest2,
        ...inSyncAndWorkStyle,
    },
    {
        ingredient_alias: 'stress_tolerance',
        ...ingredientsAndAttributeTest2,
        ...inSyncAndWorkStyle,
    },
    {
        ingredient_group: 'stakeholder_savvy',
        ingredient_alias: 'enterprising',
        ...ingredientsAndAttributeTest1,
        ingredient_framework: 'work_interest',
    },
    {
        ingredient_group: 'stakeholder_savvy',
        ingredient_alias: 'relationships',
        ...ingredientsAndAttributeTest1,
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'leadership',
        ...ingredientsAndAttributeTest1,
        ...stakeholderSavvyWorkStyle,
    },
    {
        ingredient_alias: 'social_orientation',
        ...ingredientsAndAttributeTest1,
        ...stakeholderSavvyWorkStyle,
    },
    {
        ingredient_alias: 'self_control',
        ...ingredientsAndAttributeTest1,
        ...stakeholderSavvyWorkStyle,
    },
    {
        ingredient_group: 'plus',
        ingredient_alias: 'reasoning_verbal',
        ...ingredientsAndAttributeTest5,
    },
    {
        ingredient_group: 'plus',
        ingredient_alias: 'reasoning_logical',
        ...ingredientsAndAttributeTest5,
    },
    {
        ingredient_group: 'plus',
        ingredient_alias: 'reasoning_numeric',
        ...ingredientsAndAttributeTest5,
    },
    {
        ingredient_alias: 'people_centric',
        ...ingredientsAndAttributeTest4,
    },
    {
        ingredient_alias: 'ownership',
        ...ingredientsAndAttributeTest4,
    },
    {
        ingredient_alias: 'learning',
        ...ingredientsAndAttributeTest4,
    },
    {
        ingredient_alias: 'avant_garde',
        ...ingredientsAndAttributeTest4,
    },
    {
        ingredient_alias: 'results_driven',
        ...ingredientsAndAttributeTest4,
    },
    {
        ingredient_alias: 'in_sync',
        ...ingredientsAndAttributeTest4,
    },
    {
        ingredient_alias: 'stakeholder_savvy',
        ...ingredientsAndAttributeTest4,
    },
    {
        ingredient_alias: 'plus',
        ...ingredientsAndAttributeTest4,
    },
];

const questionnaires = [
    {
        questionnaire_framework: 'personality',
        questionnaire_id: 30,
    },
    {
        questionnaire_framework: 'work_interest',
        questionnaire_id: 25,
    },
];

const mockGetFitScoreRecipe = {
    data: {
        data: {
            id: testUtil.mockUuid(1),
            company_id: TestData.companyId,
            fit_score_type: FrameworkType.CULTURE_FIT,
            fit_model_type: FitModelType.TEMPLATE,
            job_title: null,
            job_competency: [],
            recipe: cultureFitRecipe,
            questionnaire: questionnaires,
            competency_inclusiveness: false,
            framework_alias: null,
        },
    },
};

const program = {
    id: 1,
    company_id: TestData.companyId,
    name: 'Test Program',
    culture_fit_recipe_id: testUtil.mockUuid(1),
};

const entitiesFeedbackCycleRecommendationToBeAdded = [
    {
        entityClass: FeedbackCycle,
        data: [
            mockFeedbackCycleAutoApprovalData,
            mockFeedbackCycleReadyForNominationData,
        ],
    },
    {
        entityClass: Employee,
        data: [employeeReviewee1],
    },
    {
        entityClass: FeedbackCycleReviewee,
        data: [reviewee1, reviewee6],
    },
    {
        entityClass: FeedbackCycleRevieweeRecommendation,
        data: [revieweeRecommendation1, reviewee6Recommendation2],
    },
];

export const testData = {
    employeeList,
    employee1,
    employee2,
    testEmployeeUserCreatedEventData,
    testEmployeeUserCreatedEventData2,
    mockAuth0CredentialSecretResponse,
    mockMachineTokenResponse,
    mockMachineTokenRequestPayload,
    mockCompanyLookupList,
    mockLearningGoal1,
    mockLearningGoal2,
    mockEmployeeTask1,
    mockEmployeeTask2,
    employeeTasks,
    learningGoals,
    mockCompanyLookupData,
    mockCompanyLookupDataWithoutModule,
    mockBQManagerAndStat,
    mockManagerReportData,
    mockSubordinateSummaries,
    entitiesFeedbackCycleActionToBeAdded,
    mockFeedbackCycleReadyForNominationData,
    mockFeedbackCycleReadyForFeedbackData,
    mockFeedbackCycleAutoApprovalData,
    entitiesFeedbackCycleReminderToBeAdded,
    mockFeedbackCycleReminderData,
    entitiesFeedbackCycleRecommendationToBeAdded,
    mockFeedbackRecommendationGenerationProcessEvent,
    mockFeedbackRecommendationGenerationRequestData,
    mockRecommendationActionResponse,
    mockRecommendationResourceResponse,
    reviewee1,
    reviewee6,
    mockFeedbackRecommendationGenerationEndedEvent,
    program,
    mockGetFitScoreRecipe,
};
