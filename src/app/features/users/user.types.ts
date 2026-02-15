export interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface ReqResSupport {
  url: string;
  text: string;
}

export interface ReqResMetaCta {
  label: string;
  url: string;
}

export interface ReqResMeta {
  powered_by: string;
  docs_url: string;
  upgrade_url: string;
  example_url: string;
  variant: string;
  message: string;
  cta: ReqResMetaCta;
  context: string;
}

export interface UsersListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ReqResUser[];
  support: ReqResSupport;
  _meta?: ReqResMeta;
}

export interface UserDetailsResponse {
  data: ReqResUser;
  support: ReqResSupport;
  _meta?: ReqResMeta;
}
