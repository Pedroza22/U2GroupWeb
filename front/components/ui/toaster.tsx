"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"

// Componentes simplificados para evitar errores de importación
const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ToastViewport = (props: any) => <div {...props} />;
const Toast = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const ToastClose = ({ children, ...props }: any) => <button {...props}>{children}</button>;
const ToastDescription = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const ToastTitle = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
