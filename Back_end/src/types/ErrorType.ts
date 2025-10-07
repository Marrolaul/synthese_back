export interface ErrorType extends Error {
    status?: number
    code?: string
}