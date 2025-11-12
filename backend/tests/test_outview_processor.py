"""
Tests básicos para OutViewProcessor

Valida que el procesador pueda:
1. Importar correctamente
2. Instanciar la clase
3. Tener los métodos esperados
4. Tener las constantes configuradas
"""

import sys
import os

# Agregar el directorio backend/app al path para imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))


def test_import_outview_processor():
    """Test que el módulo se puede importar"""
    try:
        from processors.outview_processor import OutViewProcessor, procesar_outview_excel
        print("✓ Import exitoso de OutViewProcessor y procesar_outview_excel")
        return True
    except ImportError as e:
        print(f"✗ Error importando OutViewProcessor: {e}")
        return False


def test_outview_processor_instantiation():
    """Test que la clase se puede instanciar con un DataFrame vacío"""
    try:
        from processors.outview_processor import OutViewProcessor
        import pandas as pd

        # Crear DataFrame vacío para testing
        df = pd.DataFrame()
        processor = OutViewProcessor(df)

        print("✓ OutViewProcessor se puede instanciar")
        return True
    except Exception as e:
        print(f"✗ Error instanciando OutViewProcessor: {e}")
        return False


def test_outview_processor_constants():
    """Test que las constantes están definidas correctamente"""
    try:
        from processors.outview_processor import OutViewProcessor
        import pandas as pd

        df = pd.DataFrame()
        processor = OutViewProcessor(df)

        # Verificar constantes críticas
        assert processor.TIPO_CAMBIO_USD == 3.70, "TIPO_CAMBIO_USD debe ser 3.70"
        assert processor.FACTOR_LED == 0.4, "FACTOR_LED debe ser 0.4"
        assert processor.FACTOR_OTROS == 0.8, "FACTOR_OTROS debe ser 0.8"
        assert len(processor.TOPES) == 15, "Debe haber 15 elementos en TOPES"
        assert len(processor.COLUMNAS_OUTPUT) == 33, "Debe haber 33 columnas en output"

        print("✓ Constantes configuradas correctamente")
        print(f"  - TIPO_CAMBIO_USD: {processor.TIPO_CAMBIO_USD}")
        print(f"  - FACTOR_LED: {processor.FACTOR_LED}")
        print(f"  - FACTOR_OTROS: {processor.FACTOR_OTROS}")
        print(f"  - TOPES: {len(processor.TOPES)} elementos")
        print(f"  - COLUMNAS_OUTPUT: {len(processor.COLUMNAS_OUTPUT)} columnas")

        return True
    except AssertionError as e:
        print(f"✗ Error en constantes: {e}")
        return False
    except Exception as e:
        print(f"✗ Error verificando constantes: {e}")
        return False


def test_outview_processor_methods():
    """Test que los métodos esperados existen"""
    try:
        from processors.outview_processor import OutViewProcessor
        import pandas as pd

        df = pd.DataFrame()
        processor = OutViewProcessor(df)

        # Verificar que los métodos existen
        required_methods = [
            'procesar',
            '_leer_excel',
            '_calcular_denominador_1',
            '_calcular_denominador_2',
            '_calcular_tarifas',
            '_aplicar_topes',
            '_crear_codigo_unico',
            '_crear_codigo_pieza',
            '_agregar_columnas_derivadas',
            '_reordenar_columnas',
            '_generar_excel_output'
        ]

        missing_methods = []
        for method in required_methods:
            if not hasattr(processor, method):
                missing_methods.append(method)

        if missing_methods:
            print(f"✗ Métodos faltantes: {', '.join(missing_methods)}")
            return False

        print(f"✓ Todos los métodos requeridos existen ({len(required_methods)} métodos)")
        return True
    except Exception as e:
        print(f"✗ Error verificando métodos: {e}")
        return False


def test_procesar_outview_excel_exists():
    """Test que la función procesar_outview_excel existe"""
    try:
        from processors.outview_processor import procesar_outview_excel

        # Verificar que es callable
        assert callable(procesar_outview_excel), "procesar_outview_excel debe ser callable"

        print("✓ Función procesar_outview_excel existe y es callable")
        return True
    except Exception as e:
        print(f"✗ Error con procesar_outview_excel: {e}")
        return False


def run_all_tests():
    """Ejecuta todos los tests y muestra resumen"""
    print("=" * 60)
    print("TESTS BÁSICOS - OutViewProcessor")
    print("=" * 60)
    print()

    tests = [
        ("Import OutViewProcessor", test_import_outview_processor),
        ("Instanciar OutViewProcessor", test_outview_processor_instantiation),
        ("Verificar constantes", test_outview_processor_constants),
        ("Verificar métodos", test_outview_processor_methods),
        ("Verificar función procesar_outview_excel", test_procesar_outview_excel_exists),
    ]

    results = []
    for name, test_func in tests:
        print(f"\n{name}:")
        print("-" * 60)
        result = test_func()
        results.append((name, result))

    # Resumen
    print()
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")

    print()
    print(f"Total: {passed}/{total} tests pasaron")

    if passed == total:
        print("✓ Todos los tests pasaron!")
        return 0
    else:
        print("✗ Algunos tests fallaron")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
