"use client"

import PolicyLayout from "@/components/policy/policy-layout"

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Política de Privacidad">
      <div className="prose prose-blue max-w-none">
        <h2>Introducción</h2>
        <p>
          En U2Group, valoramos y respetamos su privacidad. Esta Política de Privacidad describe cómo recopilamos, 
          utilizamos, compartimos y protegemos la información personal que usted nos proporciona cuando utiliza 
          nuestro sitio web y servicios.
        </p>

        <h2>Información que recopilamos</h2>
        <p>
          Podemos recopilar los siguientes tipos de información:
        </p>
        <ul>
          <li><strong>Información personal:</strong> Nombre, dirección de correo electrónico, número de teléfono, dirección postal.</li>
          <li><strong>Información de pago:</strong> Detalles de tarjetas de crédito, información bancaria (procesada de forma segura a través de nuestros proveedores de pago).</li>
          <li><strong>Información de uso:</strong> Cómo interactúa con nuestro sitio, preferencias, páginas visitadas.</li>
          <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo utilizado, sistema operativo.</li>
        </ul>

        <h2>Cómo utilizamos su información</h2>
        <p>
          Utilizamos la información recopilada para:
        </p>
        <ul>
          <li>Proporcionar, mantener y mejorar nuestros servicios</li>
          <li>Procesar transacciones y enviar notificaciones relacionadas</li>
          <li>Responder a sus consultas y solicitudes</li>
          <li>Personalizar su experiencia en nuestro sitio</li>
          <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>

        <h2>Compartición de información</h2>
        <p>
          Podemos compartir su información con:
        </p>
        <ul>
          <li>Proveedores de servicios que nos ayudan a operar nuestro negocio</li>
          <li>Socios comerciales con su consentimiento</li>
          <li>Autoridades legales cuando sea requerido por ley</li>
        </ul>

        <h2>Seguridad de datos</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal 
          contra acceso no autorizado, pérdida o alteración.
        </p>

        <h2>Sus derechos</h2>
        <p>
          Dependiendo de su ubicación, puede tener derechos relacionados con sus datos personales, incluyendo:
        </p>
        <ul>
          <li>Acceso a sus datos personales</li>
          <li>Corrección de información inexacta</li>
          <li>Eliminación de sus datos</li>
          <li>Restricción u objeción al procesamiento</li>
          <li>Portabilidad de datos</li>
        </ul>

        <h2>Contacto</h2>
        <p>
          Si tiene preguntas sobre esta Política de Privacidad, por favor contáctenos a través de:
          <br />
          Email: privacy@u2group.com
          <br />
          Teléfono: +1 (555) 123-4567
        </p>

        <p className="text-sm text-gray-500 mt-8">
          Última actualización: 1 de noviembre de 2023
        </p>
      </div>
    </PolicyLayout>
  )
}