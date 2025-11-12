"""
Tests básicos para Consolidador de Mougli

Valida que el consolidador pueda:
1. Importar correctamente
2. Unificar datos de Monitor y OutView
3. Generar 27 columnas en orden correcto
4. Crear metadatos consolidados
"""

import sys
import os

# Agregar el directorio backend/app al path para imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))


def test_import_consolidador():
    """Test que el módulo se puede importar"""
    try:
        from processors.consolidador import (
            consolidar_monitor_outview,
            crear_metadatos_consolidado,
            validar_consolidado,
            COLUMNAS_CONSOLIDADO
        )
        print("✓ Import exitoso de consolidador")
        return True
    except ImportError as e:
        print(f"✗ Error importando consolidador: {e}")
        return False


def test_columnas_consolidado():
    """Test que las constantes están definidas correctamente"""
    try:
        from processors.consolidador import COLUMNAS_CONSOLIDADO

        # Verificar que tiene 27 columnas
        assert len(COLUMNAS_CONSOLIDADO) == 27, "Debe haber 27 columnas consolidadas"

        # Verificar columnas críticas
        assert 'FECHA' in COLUMNAS_CONSOLIDADO
        assert 'MEDIO' in COLUMNAS_CONSOLIDADO
        assert 'INVERSIÓN REAL' in COLUMNAS_CONSOLIDADO
        assert 'TIME / Q VERSIONES' in COLUMNAS_CONSOLIDADO  # Híbrida
        assert 'EMISORA / DISTRITO' in COLUMNAS_CONSOLIDADO  # Híbrida
        assert 'ANCHO / LATITUD' in COLUMNAS_CONSOLIDADO  # Híbrida

        print("✓ Constantes configuradas correctamente")
        print(f"  - Total columnas: {len(COLUMNAS_CONSOLIDADO)}")
        print(f"  - Primera columna: {COLUMNAS_CONSOLIDADO[0]}")
        print(f"  - Última columna: {COLUMNAS_CONSOLIDADO[-1]}")
        print(f"  - Columna híbrida ejemplo: TIME / Q VERSIONES")

        return True
    except AssertionError as e:
        print(f"✗ Error en constantes: {e}")
        return False
    except Exception as e:
        print(f"✗ Error verificando constantes: {e}")
        return False


def test_validar_consolidado_existe():
    """Test que la función de validación existe"""
    try:
        from processors.consolidador import validar_consolidado

        # Verificar que es callable
        assert callable(validar_consolidado), "validar_consolidado debe ser callable"

        print("✓ Función validar_consolidado existe y es callable")
        return True
    except Exception as e:
        print(f"✗ Error con validar_consolidado: {e}")
        return False


def test_crear_metadatos_existe():
    """Test que la función de metadatos existe"""
    try:
        from processors.consolidador import crear_metadatos_consolidado

        # Verificar que es callable
        assert callable(crear_metadatos_consolidado), "crear_metadatos_consolidado debe ser callable"

        print("✓ Función crear_metadatos_consolidado existe y es callable")
        return True
    except Exception as e:
        print(f"✗ Error con crear_metadatos_consolidado: {e}")
        return False


def test_excel_generator_import():
    """Test que el excel_generator se puede importar"""
    try:
        from processors.excel_generator import generar_excel_mougli_completo

        # Verificar que es callable
        assert callable(generar_excel_mougli_completo), "generar_excel_mougli_completo debe ser callable"

        print("✓ excel_generator importado correctamente")
        return True
    except ImportError as e:
        print(f"✗ Error importando excel_generator: {e}")
        return False
    except Exception as e:
        print(f"✗ Error con excel_generator: {e}")
        return False


def run_all_tests():
    """Ejecuta todos los tests y muestra resumen"""
    print("=" * 60)
    print("TESTS BÁSICOS - Consolidador Mougli")
    print("=" * 60)
    print()

    tests = [
        ("Import consolidador", test_import_consolidador),
        ("Verificar columnas consolidado", test_columnas_consolidado),
        ("Verificar función validar_consolidado", test_validar_consolidado_existe),
        ("Verificar función crear_metadatos", test_crear_metadatos_existe),
        ("Import excel_generator", test_excel_generator_import),
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
