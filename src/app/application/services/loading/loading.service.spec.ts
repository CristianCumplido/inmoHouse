import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    // Arrange - Setup del módulo de testing
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });

    service = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      // Arrange & Act - El servicio ya está creado en beforeEach

      // Assert
      expect(service).toBeTruthy();
    });

    it('should initialize with loading state as false', (done) => {
      // Arrange & Act - El servicio ya está inicializado

      // Assert
      service.loading$.subscribe((loading) => {
        expect(loading).toBeFalsy();
        done();
      });
    });

    it('should have loading$ observable available', () => {
      // Arrange & Act - Observable ya está disponible

      // Assert
      expect(service.loading$).toBeDefined();
      expect(typeof service.loading$.subscribe).toBe('function');
    });
  });

  describe('show()', () => {
    it('should set loading state to true', (done) => {
      // Arrange
      let loadingState: boolean;

      // Act
      service.loading$.subscribe((loading) => {
        loadingState = loading;
        if (loadingState === true) {
          // Assert
          expect(loadingState).toBeTruthy();
          done();
        }
      });

      service.show();
    });

    it('should emit true through loading$ observable', () => {
      // Arrange
      const mockObserver = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
      };

      // Act
      service.loading$.subscribe(mockObserver);
      service.show();

      // Assert
      expect(mockObserver.next).toHaveBeenCalledWith(true);
    });

    it('should emit immediately when subscribed after show is called', (done) => {
      // Arrange & Act
      service.show();

      // Assert - Nueva suscripción debe recibir el último valor (true)
      service.loading$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        done();
      });
    });

    it('should allow multiple calls to show without side effects', () => {
      // Arrange
      const emittedValues: boolean[] = [];

      service.loading$.subscribe((loading) => {
        emittedValues.push(loading);
      });

      // Act
      service.show();
      service.show();
      service.show();

      // Assert
      expect(emittedValues).toEqual([false, true, true, true]);
    });
  });

  describe('hide()', () => {
    it('should set loading state to false', (done) => {
      // Arrange - Primero mostrar loading
      service.show();
      let emissionCount = 0;

      // Act
      service.loading$.subscribe((loading) => {
        emissionCount++;
        if (emissionCount === 2) {
          // Segunda emisión después de hide()
          // Assert
          expect(loading).toBeFalsy();
          done();
        }
      });

      service.hide();
    });

    it('should emit false through loading$ observable', () => {
      // Arrange
      service.show(); // Primero mostrar
      const mockObserver = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
      };

      service.loading$.subscribe(mockObserver);
      mockObserver.next.mockClear(); // Limpiar llamadas anteriores

      // Act
      service.hide();

      // Assert
      expect(mockObserver.next).toHaveBeenCalledWith(false);
    });

    it('should emit immediately when subscribed after hide is called', (done) => {
      // Arrange
      service.show();

      // Act
      service.hide();

      // Assert - Nueva suscripción debe recibir el último valor (false)
      service.loading$.subscribe((loading) => {
        expect(loading).toBeFalsy();
        done();
      });
    });

    it('should allow multiple calls to hide without side effects', () => {
      // Arrange
      const emittedValues: boolean[] = [];

      service.loading$.subscribe((loading) => {
        emittedValues.push(loading);
      });

      service.show(); // Primero mostrar

      // Act
      service.hide();
      service.hide();
      service.hide();

      // Assert
      expect(emittedValues).toEqual([false, true, false, false, false]);
    });
  });

  describe('Observable Behavior', () => {
    it('should maintain state consistency across multiple subscribers', () => {
      // Arrange
      const subscriber1Values: boolean[] = [];
      const subscriber2Values: boolean[] = [];

      service.loading$.subscribe((loading) => subscriber1Values.push(loading));

      // Act
      service.show();

      // Segundo suscriptor se une después de show()
      service.loading$.subscribe((loading) => subscriber2Values.push(loading));

      service.hide();

      // Assert
      expect(subscriber1Values).toEqual([false, true, false]);
      expect(subscriber2Values).toEqual([true, false]); // Recibe último valor al suscribirse
    });

    it('should handle rapid show/hide calls correctly', () => {
      // Arrange
      const emittedValues: boolean[] = [];

      service.loading$.subscribe((loading) => {
        emittedValues.push(loading);
      });

      // Act - Llamadas rápidas
      service.show();
      service.hide();
      service.show();
      service.hide();

      // Assert
      expect(emittedValues).toEqual([false, true, false, true, false]);
    });

    it('should emit distinct values through the observable', () => {
      // Arrange
      const emittedValues: boolean[] = [];

      service.loading$.subscribe((loading) => {
        emittedValues.push(loading);
      });

      // Act
      service.show();
      service.show(); // Mismo valor
      service.hide();
      service.hide(); // Mismo valor

      // Assert - BehaviorSubject emite todos los valores, incluso duplicados
      expect(emittedValues).toEqual([false, true, true, false, false]);
    });

    it('should be a hot observable (BehaviorSubject)', (done) => {
      // Arrange
      service.show();

      // Act & Assert
      service.loading$.subscribe((loading) => {
        // BehaviorSubject emite inmediatamente el último valor
        expect(loading).toBeTruthy();
        done();
      });
    });
  });

  describe('State Transitions', () => {
    it('should transition from false to true when show is called', () => {
      // Arrange
      const stateTransitions: boolean[] = [];

      service.loading$.subscribe((loading) => {
        stateTransitions.push(loading);
      });

      // Act
      service.show();

      // Assert
      expect(stateTransitions).toEqual([false, true]);
    });

    it('should transition from true to false when hide is called', () => {
      // Arrange
      const stateTransitions: boolean[] = [];

      service.loading$.subscribe((loading) => {
        stateTransitions.push(loading);
      });

      service.show();

      // Act
      service.hide();

      // Assert
      expect(stateTransitions).toEqual([false, true, false]);
    });

    it('should handle complex state transition sequences', () => {
      // Arrange
      const stateTransitions: boolean[] = [];

      service.loading$.subscribe((loading) => {
        stateTransitions.push(loading);
      });

      // Act - Secuencia compleja
      service.show(); // false -> true
      service.show(); // true -> true
      service.hide(); // true -> false
      service.show(); // false -> true
      service.hide(); // true -> false
      service.hide(); // false -> false

      // Assert
      expect(stateTransitions).toEqual([
        false,
        true,
        true,
        false,
        true,
        false,
        false,
      ]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should not throw errors when called multiple times rapidly', () => {
      // Arrange & Act & Assert
      expect(() => {
        for (let i = 0; i < 100; i++) {
          service.show();
          service.hide();
        }
      }).not.toThrow();
    });

    it('should handle subscription and unsubscription correctly', () => {
      // Arrange
      const emittedValues: boolean[] = [];

      const subscription = service.loading$.subscribe((loading) => {
        emittedValues.push(loading);
      });

      // Act
      service.show();
      subscription.unsubscribe();
      service.hide(); // No debería ser recibido por el subscriber

      // Assert
      expect(emittedValues).toEqual([false, true]);
    });

    it('should maintain observable after unsubscription and resubscription', () => {
      // Arrange
      let subscription = service.loading$.subscribe();
      service.show();
      subscription.unsubscribe();

      // Act
      const newEmittedValues: boolean[] = [];
      service.loading$.subscribe((loading) => {
        newEmittedValues.push(loading);
      });

      service.hide();

      // Assert
      expect(newEmittedValues).toEqual([true, false]); // Recibe último valor y nuevo
    });
  });

  describe('Memory Management', () => {
    it('should not create memory leaks with multiple subscriptions', () => {
      // Arrange
      const subscriptions = [];

      // Act
      for (let i = 0; i < 10; i++) {
        const sub = service.loading$.subscribe();
        subscriptions.push(sub);
      }

      service.show();
      service.hide();

      // Cleanup
      subscriptions.forEach((sub) => sub.unsubscribe());

      // Assert - No debería haber errores
      expect(subscriptions.length).toBe(10);
    });
  });

  describe('Service Singleton Behavior', () => {
    it('should maintain the same instance across multiple injections', () => {
      // Arrange & Act
      const service1 = TestBed.inject(LoadingService);
      const service2 = TestBed.inject(LoadingService);

      // Assert
      expect(service1).toBe(service2);
    });

    it('should share state between different injection points', (done) => {
      // Arrange
      const service1 = TestBed.inject(LoadingService);
      const service2 = TestBed.inject(LoadingService);

      // Act
      service1.show();

      // Assert
      service2.loading$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        done();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle typical loading workflow', () => {
      // Arrange
      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      // Act - Simular flujo típico de carga
      service.show(); // Iniciar operación async
      // ... operación en progreso ...
      service.hide(); // Operación completada

      // Assert
      expect(loadingStates).toEqual([false, true, false]);
    });

    it('should handle overlapping loading operations', () => {
      // Arrange
      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      // Act - Simular operaciones superpuestas
      service.show(); // Primera operación
      service.show(); // Segunda operación (superpuesta)
      service.hide(); // Primera operación termina
      service.hide(); // Segunda operación termina

      // Assert
      expect(loadingStates).toEqual([false, true, true, false, false]);
    });
  });
});
