export type TableColumnType =
  | 'boolean'
  | 'number'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'varchar'
  | 'longtext'
  | 'json'

export interface App {
  id: string
  name: string
  status: 'initializing' | 'active' | 'stopped'
  state: any
  manifest: AppManifest
  is_native: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  ui_token?: string // token used to authenticate to the UI for private apps
}

export interface AppManifest {
  id: string
  name: string
  homepage: string
  author: string
  icon_url: string
  short_description: string
  description: string
  version: string
  ui_endpoint: string
  webhook_endpoint: string
  tasks?: Task[]
  app_tables?: AppTable[]
  data_hooks?: DataHook[]
  extra_columns?: ExtraColumnsManifest[]
  sql_queries?: SqlQuery[]
  is_native?: boolean
}

export interface SqlQuery {
  id: string
  type: 'select'
  name: string
  description: string
  query: string
  test_args: string[]
}

export interface ExtraColumnsManifest {
  kind: string
  columns: TableColumn[]
}

export interface Task {
  id: string
  external_id: string
  name: string
  on_multiple_exec: 'allow' | 'discard_new' | 'retry_later' | 'abort_existing'
  app_id: string
  is_active: boolean
  is_cron: boolean
  minutes_interval: number // in minutes
  next_run?: string
  last_run?: string
}

export interface AppTable {
  name: string
  app_id?: string
  storage_type: 'columnstore' | 'rowstore'
  description?: string
  columns: TableColumn[]
  joins: TableJoin[]
  shard_key: string[]
  unique_key: string[]
  sort_key: string[]
  timeseries_column?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface TableColumn {
  name: string
  type: TableColumnType
  size?: number
  is_required: boolean
  description?: string
  default_boolean?: boolean
  default_number?: number
  default_date?: string
  default_datetime?: string
  default_timestamp?: string
  default_string?: string
  default_json?: object
  extra_definition?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface TableJoin {
  external_table: string
  external_column: string
  local_column: string
  relationship: 'has_one' | 'has_many' | 'belongs_to'
}

export interface DataHook {
  id: string
  app_id: string
  name: string
  on: 'on_validation' | 'on_success'
  kind: string[]
  action: string[]
  js?: string
  enabled: boolean
  db_created_at: string
  db_updated_at: string
}

export interface UpdatedField {
  field: string
  previous: any
  new: any
}

export interface User {
  id: string
  external_id: string
  is_merged?: boolean
  merged_to?: string
  merged_at?: Date
  is_authenticated: boolean
  signed_up_at?: Date
  created_at: Date
  created_at_trunc: Date
  last_interaction_at: Date
  timezone: string
  language: string
  country: string
  db_created_at: string
  db_updated_at: string
  //   mergeable_fields: MergeableFields
  // optional fields:
  user_centric_consent?: boolean
  last_ip?: string
  longitude?: number
  latitude?: number
  geo?: any
  first_name?: string
  last_name?: string
  gender?: string
  birthday?: string
  photo_url?: string
  email?: string
  email_md5?: string
  email_sha1?: string
  email_sha256?: string
  telephone?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  region?: string
  postal_code?: string
  state?: string
  // computed fields:
  orders_count: number
  orders_ltv: number
  orders_avg_cart: number
  first_order_at?: Date
  first_order_subtotal: number
  first_order_ttc: number
  last_order_at?: Date
  avg_repeat_cart: number
  avg_repeat_order_ttc: number
  [key: string]: any // extra fields
}

export interface DataHookPayload {
  data_hook_id: string
  data_hook_name: string
  data_hook_on: 'on_validation' | 'on_success'
  data_log_id: string
  data_log_kind: string
  data_log_action: string
  data_log_item: string
  data_log_item_id: string
  data_log_item_external_id: string
  data_log_updated_fields: UpdatedField[]
  user: User
}

export interface TaskExecWorkerPayload {
  task_kind: string
  task_name: string
  task_exec_id: string
  task_exec_created_at: string
  worker_id: number
  worker_state: object
  retry_count: number
}

export interface WebhookPayload {
  workspace_id: string
  app_id: string
  api_endpoint: string
  collector_endpoint: string
  kind: 'data_hook' | 'task_exec_worker'
  app_state?: object
  task_exec_worker?: TaskExecWorkerPayload
  data_hook?: DataHookPayload
}

export interface WebhookResult {
  is_done: boolean
  is_error: boolean
  message?: string
  // for task_exec webhooks only:
  updated_worker_state: any
  worker_id: number
  delay_next_request_in_secs?: number
}

export interface AppStateMutation {
  operation: 'set' | 'delete'
  key: string
  value: any
}

export interface AppMutateState {
  workspace_id: string
  id: string
  mutations: AppStateMutation[]
}

export interface AppFromToken {
  workspace_id: string
  api_endpoint: string
  collector_endpoint: string
  app: App
}

export interface Account {
  id: string
  full_name?: string
  timezone: string
  email: string
  locale: string
  hashed_password: string
  is_service_account: boolean
  is_root: boolean
  created_at: string
  updated_at: string
}

export interface LoginResult {
  // Account               *entity.Account `json:"account"`
  // RefreshToken          string          `json:"refresh_token"`
  // RefreshTokenExpiresAt time.Time       `json:"refresh_token_expires_at"`
  // AccessToken           string          `json:"access_token"`
  // AccessTokenExpiresAt  time.Time       `json:"access_token_expires_at"`
  account: Account
  refresh_token: string
  refresh_token_expires_at: Date
  access_token: string
  access_token_expires_at: Date
}

export interface ConnectedApp {
  api_endpoint: string
  collector_endpoint: string
  workspace_id: string
  app_id: string
  email: string
  encrypted_password: string
}

interface AccessTokenCacheForApiEndpoint {
  [email: string]: LoginResult
}
export interface AccessTokenCache {
  [api_endpoint: string]: AccessTokenCacheForApiEndpoint
}

export interface ExecQuery {
  api_endpoint: string
  workspace_id: string
  app_id: string
  query_id: string
  query?: string
  args?: any[]
}

export interface ExecQueryResult {
  rows: any[]
  took_ms: number
}
