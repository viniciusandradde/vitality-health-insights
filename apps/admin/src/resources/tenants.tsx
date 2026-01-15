import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  Show,
  SimpleShowLayout,
  BooleanInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
  required,
} from "react-admin";

export const TenantList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" label="Nome" />
      <TextField source="slug" label="Slug" />
      <TextField source="email" label="Email" />
      <TextField source="is_active" label="Ativo" />
    </Datagrid>
  </List>
);

export const TenantEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Nome" validate={required()} />
      <TextInput source="slug" label="Slug" validate={required()} />
      <TextInput source="email" label="Email" />
      <TextInput source="phone" label="Telefone" />
      <TextInput source="cnpj" label="CNPJ" />
      <TextInput source="logo_url" label="URL do Logo" />
      <TextInput source="primary_color" label="Cor Primária" />
      <TextInput source="timezone" label="Timezone" />
      <TextInput source="language" label="Idioma" />
      <NumberInput source="max_users" label="Máximo de Usuários" />
      <NumberInput source="data_retention_days" label="Dias de Retenção" />
      <ArrayInput source="modules_enabled" label="Módulos Habilitados">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>
      <BooleanInput source="is_active" label="Ativo" />
    </SimpleForm>
  </Edit>
);

export const TenantCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Nome" validate={required()} />
      <TextInput source="slug" label="Slug" validate={required()} />
      <TextInput source="email" label="Email" />
      <TextInput source="phone" label="Telefone" />
      <TextInput source="cnpj" label="CNPJ" />
      <TextInput source="logo_url" label="URL do Logo" />
      <TextInput source="primary_color" label="Cor Primária" />
      <TextInput source="timezone" label="Timezone" defaultValue="America/Sao_Paulo" />
      <TextInput source="language" label="Idioma" defaultValue="pt-BR" />
      <NumberInput source="max_users" label="Máximo de Usuários" defaultValue={10} />
      <NumberInput source="data_retention_days" label="Dias de Retenção" defaultValue={365} />
      <BooleanInput source="is_active" label="Ativo" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export const TenantShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" label="Nome" />
      <TextField source="slug" label="Slug" />
      <TextField source="email" label="Email" />
      <TextField source="phone" label="Telefone" />
      <TextField source="cnpj" label="CNPJ" />
      <TextField source="logo_url" label="URL do Logo" />
      <TextField source="is_active" label="Ativo" />
      <TextField source="created_at" label="Criado em" />
    </SimpleShowLayout>
  </Show>
);
