declare module 'eos-ui-kit' {
  import { DefineComponent } from 'vue'

  export enum InputType {
    Text = 'text',
    Email = 'email',
    Password = 'password',
    Tel = 'tel',
  }

  export interface InputProps {
    modelValue?: string
    type?: InputType
    placeholder?: string
    helperText?: string
    error?: string
    disabled?: boolean
  }

  export interface InputEmits {
    (event: 'update:modelValue', value: string): void
  }

  export const EosInput: DefineComponent<InputProps>

  export enum ButtonSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
  }

  export enum ButtonVariant {
    Primary = 'primary',
    Secondary = 'secondary',
    Tertiary = 'tertiary',
  }

  export interface ButtonProps {
    size?: ButtonSize
    variant?: ButtonVariant
    disabled?: boolean
    loading?: boolean
    icon?: string
    iconPosition?: 'left' | 'right'
    type?: 'button' | 'submit' | 'reset'
  }

  export interface ButtonEmits {
    (event: 'click', payload: MouseEvent): void
  }

  export const EosButton: DefineComponent<ButtonProps>
}
