"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useLanguage } from "@/hooks/use-language"
import { useSiteConfig } from "@/hooks/use-site-config"
import { ContactResponse } from "@/types"
import axios from "axios";

export default function ContactoPage() {
  const { t } = useLanguage()
  const { config: siteConfig } = useSiteConfig()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    projectLocation: "",
    timeline: "",
    comments: "",
  })
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setExito(false);
    setError("");
    
    console.log('📤 Enviando mensaje de contacto:', formData);
    
    try {
      const response = await axios.post("/api/admin/send-contact-message/", formData);
      console.log('✅ Respuesta del servidor:', response.data);

      const responseData = response.data as ContactResponse;

      if (responseData.status === 'success') {
        setExito(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          projectLocation: "",
          timeline: "",
          comments: "",
        });
      } else {
        setError(responseData.message || t("messageError"));
      }
    } catch (err: any) {
      console.error('❌ Error enviando mensaje:', err);
      if (err.response?.data?.message) {
        setError((err.response.data as ContactResponse).message || t("messageError"));
      } else {
        setError(t("messageError"));
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white neutra-font">
      <Header currentPage="contacto" />

      {/* HERO SECTION */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl neutra-font-black mb-4">{t("contactTitle")}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto neutra-font">{t("contactSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-8" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* INFORMACIÓN DE CONTACTO */}
          <div>
            <h2 className="text-3xl neutra-font-bold text-gray-900 mb-8">{t("getInTouch")}</h2>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg neutra-font-bold text-gray-900 mb-1">{t("email")}</h3>
                  <p className="text-gray-600 neutra-font">{siteConfig?.contact_email || 'sales-team@u2.group'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg neutra-font-bold text-gray-900 mb-1">{t("phone")}</h3>
                  <p className="text-gray-600 neutra-font">{siteConfig?.contact_phone || '3164035330 - 3043618282'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg neutra-font-bold text-gray-900 mb-1">{t("office")}</h3>
                  <p className="text-gray-600 neutra-font">{siteConfig?.contact_address || 'Colombia'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl neutra-font-bold text-gray-900 mb-4">
                {t("whyChooseUs")}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span className="text-gray-700 neutra-font">{t("moreThan4Years")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span className="text-gray-700 neutra-font">{t("customDesigns")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span className="text-gray-700 neutra-font">{t("professionalTeam")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span className="text-gray-700 neutra-font">{t("response24h")}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FORMULARIO DE CONTACTO */}
          <div>
            <Card className="p-8 shadow-lg">
              <h3 className="text-2xl neutra-font-bold text-gray-900 mb-6">
                {t("contactInfo")}
              </h3>
              <p className="text-gray-600 neutra-font mb-8">
                {t("fillForm")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm neutra-font-bold text-gray-700 mb-2">
                      {t("firstName")} *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent neutra-font"
                      placeholder={t("firstNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm neutra-font-bold text-gray-700 mb-2">
                      {t("lastName")} *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent neutra-font"
                      placeholder={t("lastNamePlaceholder")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm neutra-font-bold text-gray-700 mb-2">
                    {t("emailAddress")} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent neutra-font"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm neutra-font-bold text-gray-700 mb-2">
                    {t("phoneNumber")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent neutra-font"
                    placeholder={t("phonePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm neutra-font-bold text-gray-700 mb-2">
                    {t("projectLocation")}
                  </label>
                  <input
                    type="text"
                    name="projectLocation"
                    value={formData.projectLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent neutra-font"
                    placeholder={t("projectLocationPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm neutra-font-bold text-gray-700 mb-2">
                    {t("projectTimeline")}
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent neutra-font"
                  >
                    <option value="">{t("selectTimeline")}</option>
                    <option value="asap">{t("asap")}</option>
                    <option value="3-months">{t("within3Months")}</option>
                    <option value="6-months">{t("within6Months")}</option>
                    <option value="1-year">{t("within1Year")}</option>
                    <option value="planning">{t("justPlanning")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm neutra-font-bold text-gray-700 mb-2">
                    {t("additionalComments")}
                  </label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent neutra-font"
                    placeholder={t("commentsPlaceholder")}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                {exito && (
                  <div className="text-green-600 text-sm">{t("messageSent")}</div>
                )}

                <Button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    t("sendingMessage")
                  ) : (
                    <>
                      {t("sendMessageButton")}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-8" />
      <Footer />
    </div>
  )
}
