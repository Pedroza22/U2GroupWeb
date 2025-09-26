"use client"

import PolicyLayout from "@/components/policy/policy-layout"

export default function TermsAndConditionsPage() {
  return (
    <PolicyLayout title="Términos y Condiciones de Uso">
      <div className="prose prose-blue max-w-none">
        <h2>Aceptación de los Términos</h2>
        <p>
          Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos y Condiciones de Uso.
          Si no está de acuerdo con alguno de estos términos, no utilice este sitio.
        </p>

        <h2>Uso del Sitio</h2>
        <p>
          Usted acepta utilizar este sitio solo para fines legales y de manera que no infrinja los derechos de otros
          usuarios o restrinja su uso del sitio. Está prohibido cualquier uso del sitio que pueda causar daño al sitio
          o afectar su disponibilidad o accesibilidad.
        </p>

        <h2>Propiedad Intelectual</h2>
        <p>
          Todo el contenido de este sitio, incluyendo pero no limitado a textos, gráficos, logotipos, imágenes, 
          clips de audio, descargas digitales, y compilaciones de datos, es propiedad de U2Group o de sus proveedores
          de contenido y está protegido por las leyes de propiedad intelectual.
        </p>

        <h2>Cuentas de Usuario</h2>
        <p>
          Al crear una cuenta en nuestro sitio, usted es responsable de mantener la confidencialidad de su cuenta
          y contraseña, y de restringir el acceso a su computadora. Usted acepta la responsabilidad por todas las
          actividades que ocurran bajo su cuenta o contraseña.
        </p>

        <h2>Limitación de Responsabilidad</h2>
        <p>
          U2Group no será responsable por daños directos, indirectos, incidentales, consecuentes o punitivos
          resultantes del uso o la imposibilidad de usar nuestros servicios o productos.
        </p>

        <h2>Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán
          en vigor inmediatamente después de su publicación en el sitio. Su uso continuado del sitio después de
          cualquier cambio constituye su aceptación de los nuevos términos.
        </p>

        <h2>Ley Aplicable</h2>
        <p>
          Estos términos se regirán e interpretarán de acuerdo con las leyes del país donde U2Group tiene su sede
          principal, sin dar efecto a ningún principio de conflicto de leyes.
        </p>

        <p className="text-sm text-gray-500 mt-8">
          Última actualización: 1 de noviembre de 2023
        </p>
      </div>
    </PolicyLayout>
  )
}