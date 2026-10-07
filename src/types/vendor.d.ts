declare module 'ajv/dist/2020.js' {
  export type ErrorObject = import('ajv').ErrorObject

  interface ValidateFunction {
    (data: unknown): boolean
    errors?: ErrorObject[] | null
  }

  interface Ajv2020Instance {
    compile(schema: unknown): ValidateFunction
  }

  const Ajv2020: new (options?: Record<string, unknown>) => Ajv2020Instance
  export default Ajv2020
}

declare module 'ajv-formats' {
  const addFormats: (ajv: unknown) => unknown
  export default addFormats
}
