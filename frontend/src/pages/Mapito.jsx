export default function Mapito({ user }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapito</h1>
      <p className="text-gray-600 mb-8">Mapas interactivos de Perú</p>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Mapito - Próximamente
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            La funcionalidad de mapas interactivos estará disponible próximamente.
            Podrás visualizar regiones, provincias y distritos de Perú con datos personalizados.
          </p>
        </div>
      </div>
    </div>
  )
}
