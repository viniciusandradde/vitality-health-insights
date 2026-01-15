import { DataProvider, fetchUtils } from "react-admin";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const httpClient = (url: string, options: any = {}) => {
  const token = localStorage.getItem("access_token");
  
  if (!options.headers) {
    options.headers = new Headers();
  }
  
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }
  
  options.headers.set("Content-Type", "application/json");
  
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      skip: (page - 1) * perPage,
      limit: perPage,
      ...params.filter,
    };

    // Map resource names to API endpoints
    let url = `${API_URL}/admin/${resource}`;
    if (resource === "users") {
      // For users, we need tenant_id from filter or use a default
      const tenantId = params.filter?.tenant_id;
      if (tenantId) {
        url = `${API_URL}/admin/tenants/${tenantId}/users`;
      } else {
        // If no tenant_id, list all users (admin/master only)
        url = `${API_URL}/admin/users`;
      }
    }

    const queryString = new URLSearchParams(
      Object.entries(query).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && key !== "tenant_id") {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const { json, headers } = await httpClient(`${url}?${queryString}`);
    
    // Extract total from headers
    const total = parseInt(headers.get("X-Total-Count") || "0", 10);

    return {
      data: json,
      total: total || json.length,
    };
  },

  getOne: async (resource, params) => {
    let url = `${API_URL}/admin/${resource}/${params.id}`;
    
    // Handle nested resources
    if (resource === "users") {
      // For users, we need tenant_id - try to get from record or use a placeholder
      // This is a limitation - we'd need tenant_id in the record
      url = `${API_URL}/admin/users/${params.id}`;
    }

    const { json } = await httpClient(url);
    return { data: json };
  },

  getMany: async (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const queryString = new URLSearchParams(query).toString();
    const { json } = await httpClient(
      `${API_URL}/admin/${resource}?${queryString}`
    );
    return { data: json };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      skip: (page - 1) * perPage,
      limit: perPage,
      [params.target]: params.id,
      ...params.filter,
    };
    const queryString = new URLSearchParams(
      Object.entries(query).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const { json, headers } = await httpClient(
      `${API_URL}/admin/${resource}?${queryString}`
    );
    
    const total = parseInt(headers.get("X-Total-Count") || "0", 10);

    return {
      data: json,
      total: total || json.length,
    };
  },

  create: async (resource, params) => {
    let url = `${API_URL}/admin/${resource}`;
    
    // Handle nested resources
    if (resource === "users") {
      const tenantId = params.data.tenant_id;
      if (tenantId) {
        url = `${API_URL}/admin/tenants/${tenantId}/users`;
      }
    }

    const { json } = await httpClient(url, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  update: async (resource, params) => {
    let url = `${API_URL}/admin/${resource}/${params.id}`;
    
    // Handle nested resources
    if (resource === "users") {
      const tenantId = params.data.tenant_id || params.previousData?.tenant_id;
      if (tenantId) {
        url = `${API_URL}/admin/tenants/${tenantId}/users/${params.id}`;
      }
    }

    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/admin/${resource}/${id}`, {
        method: "PUT",
        body: JSON.stringify(params.data),
      })
    );
    const responses = await Promise.all(promises);
    return { data: responses.map(({ json }) => json.id) };
  },

  delete: async (resource, params) => {
    let url = `${API_URL}/admin/${resource}/${params.id}`;
    
    // Handle nested resources - for delete we'd need tenant_id from previousData
    // This is a limitation of the current API structure

    await httpClient(url, {
      method: "DELETE",
    });
    return { data: { id: params.id } };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/admin/${resource}/${id}`, {
        method: "DELETE",
      })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },
};
