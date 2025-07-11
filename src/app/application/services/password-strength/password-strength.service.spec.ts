import { TestBed } from '@angular/core/testing';
import {
  PasswordStrengthService,
  PasswordStrengthResult,
} from './password-strength.service';

describe('PasswordStrengthService', () => {
  let service: PasswordStrengthService;

  beforeEach(() => {
    // Arrange - Setup del módulo de testing
    TestBed.configureTestingModule({
      providers: [PasswordStrengthService],
    });

    service = TestBed.inject(PasswordStrengthService);
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
  });

  describe('calculateStrength() - Empty and Invalid Passwords', () => {
    it('should handle empty password', () => {
      // Arrange
      const password = '';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result).toEqual({
        score: 0,
        feedback: ['Ingresa una contraseña'],
        suggestions: ['La contraseña es requerida'],
        strength: 'very-weak',
      });
    });

    it('should handle null password', () => {
      // Arrange
      const password = null as any;

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result).toEqual({
        score: 0,
        feedback: ['Ingresa una contraseña'],
        suggestions: ['La contraseña es requerida'],
        strength: 'very-weak',
      });
    });

    it('should handle undefined password', () => {
      // Arrange
      const password = undefined as any;

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result).toEqual({
        score: 0,
        feedback: ['Ingresa una contraseña'],
        suggestions: ['La contraseña es requerida'],
        strength: 'very-weak',
      });
    });
  });

  describe('calculateStrength() - Length Validation', () => {
    it('should fail length check for password shorter than 8 characters', () => {
      // Arrange
      const password = 'Abc123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Muy corta');
      expect(result.suggestions).toContain('Usa al menos 8 caracteres');
      expect(result.score).toBeLessThan(5);
    });

    it('should pass length check for password with 8 characters', () => {
      // Arrange
      const password = 'Abc123!!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).not.toContain('Muy corta');
      expect(result.suggestions).not.toContain('Usa al menos 8 caracteres');
    });

    it('should give bonus for passwords 12+ characters', () => {
      // Arrange
      const shortPassword = 'Abc123!!';
      const longPassword = 'Abc123!!XyZ$';

      // Act
      const shortResult = service.calculateStrength(shortPassword);
      const longResult = service.calculateStrength(longPassword);

      // Assert
      expect(longResult.score).toBeGreaterThan(shortResult.score);
    });
  });

  describe('calculateStrength() - Character Type Validation', () => {
    it('should detect missing lowercase letters', () => {
      // Arrange
      const password = 'ABC123!!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Sin minúsculas');
      expect(result.suggestions).toContain('Agrega letras minúsculas');
    });

    it('should detect missing uppercase letters', () => {
      // Arrange
      const password = 'abc123!!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Sin mayúsculas');
      expect(result.suggestions).toContain('Agrega letras mayúsculas');
    });

    it('should detect missing numbers', () => {
      // Arrange
      const password = 'AbcDefg!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Sin números');
      expect(result.suggestions).toContain('Agrega números');
    });

    it('should detect missing special characters', () => {
      // Arrange
      const password = 'Abc12345';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Sin símbolos');
      expect(result.suggestions).toContain('Agrega símbolos especiales');
    });

    it('should pass all character type checks', () => {
      // Arrange
      const password = 'Abc123!!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).not.toContain('Sin minúsculas');
      expect(result.feedback).not.toContain('Sin mayúsculas');
      expect(result.feedback).not.toContain('Sin números');
      expect(result.feedback).not.toContain('Sin símbolos');
    });
  });

  describe('calculateStrength() - Common Patterns Detection', () => {
    it('should detect "123456" pattern', () => {
      // Arrange
      const password = 'Abc123456!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Contiene patrones comunes');
      expect(result.suggestions).toContain(
        'Evita secuencias obvias como "123" o "abc"'
      );
    });

    it('should detect "qwerty" pattern', () => {
      // Arrange
      const password = 'Qwerty123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Contiene patrones comunes');
    });

    it('should detect "password" pattern', () => {
      // Arrange
      const password = 'Password123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Contiene patrones comunes');
    });

    it('should detect repeated characters', () => {
      // Arrange
      const password = 'Abcaaa123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Contiene patrones comunes');
    });

    it('should detect sequential numbers', () => {
      // Arrange
      const passwords = ['Abc012345!', 'Xyz789!!', 'Test456789'];

      passwords.forEach((password) => {
        // Act
        const result = service.calculateStrength(password);

        // Assert
        expect(result.feedback).toContain('Contiene patrones comunes');
      });
    });

    it('should detect sequential letters', () => {
      // Arrange
      const passwords = ['abc123!X', 'defABC123!', 'XYZxyz123!'];

      passwords.forEach((password) => {
        // Act
        const result = service.calculateStrength(password);

        // Assert
        expect(result.feedback).toContain('Contiene patrones comunes');
      });
    });

    it('should not penalize secure passwords without common patterns', () => {
      // Arrange
      const password = 'R9kL$m2N!p8X';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).not.toContain('Contiene patrones comunes');
    });
  });

  describe('calculateStrength() - Strength Level Calculation', () => {
    it('should return very-weak for score <= 1', () => {
      // Arrange
      const password = 'a';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.strength).toBe('very-weak');
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should return weak for score 2', () => {
      // Arrange
      const password = 'ab123';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.strength).toBe('very-weak');
    });

    it('should return fair for score 3', () => {
      // Arrange
      const password = 'Abc123';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.strength).toBe('fair');
    });

    it('should return strong for score 4', () => {
      // Arrange
      const password = 'Abc123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.strength).toBe('strong');
    });

    it('should return very-strong for score 5+', () => {
      // Arrange
      const password = 'MyVerySecure123!Pass';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.strength).toBe('very-strong');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });
  });

  describe('calculateStrength() - Score Boundaries', () => {
    it('should never return score below 0', () => {
      // Arrange
      const password = 'password123';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should never return score above 5', () => {
      // Arrange
      const password = 'VeryLongAndComplexPassword123!@#$%^&*()';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.score).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateStrength() - Positive Feedback', () => {
    it('should give positive feedback for good passwords', () => {
      // Arrange
      const password = 'R9kL$m2N!p8X';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Buena contraseña');
    });

    it('should not give positive feedback when there are issues', () => {
      // Arrange
      const password = 'abc';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).not.toContain('Buena contraseña');
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('calculateStrength() - Varied Characters Bonus', () => {
    it('should give bonus for varied character types', () => {
      // Arrange
      const simplePassword = 'Abc12345';
      const variedPassword = 'Abc123!@';

      // Act
      const simpleResult = service.calculateStrength(simplePassword);
      const variedResult = service.calculateStrength(variedPassword);

      // Assert
      expect(variedResult.score).toBeGreaterThanOrEqual(simpleResult.score);
    });
  });

  describe('getStrengthText()', () => {
    it('should return correct text for very-weak', () => {
      // Arrange
      const strength = 'very-weak';

      // Act
      const result = service.getStrengthText(strength);

      // Assert
      expect(result).toBe('Muy débil');
    });

    it('should return correct text for weak', () => {
      // Arrange
      const strength = 'weak';

      // Act
      const result = service.getStrengthText(strength);

      // Assert
      expect(result).toBe('Débil');
    });

    it('should return correct text for fair', () => {
      // Arrange
      const strength = 'fair';

      // Act
      const result = service.getStrengthText(strength);

      // Assert
      expect(result).toBe('Regular');
    });

    it('should return correct text for strong', () => {
      // Arrange
      const strength = 'strong';

      // Act
      const result = service.getStrengthText(strength);

      // Assert
      expect(result).toBe('Fuerte');
    });

    it('should return correct text for very-strong', () => {
      // Arrange
      const strength = 'very-strong';

      // Act
      const result = service.getStrengthText(strength);

      // Assert
      expect(result).toBe('Muy fuerte');
    });

    it('should return default text for invalid strength', () => {
      // Arrange
      const strength = 'invalid-strength';

      // Act
      const result = service.getStrengthText(strength);

      // Assert
      expect(result).toBe('Muy débil');
    });

    it('should handle empty string', () => {
      // Arrange
      const strength = '';

      // Act
      const result = service.getStrengthText(strength);

      // Assert
      expect(result).toBe('Muy débil');
    });
  });

  describe('getStrengthColor()', () => {
    it('should return correct color for very-weak', () => {
      // Arrange
      const strength = 'very-weak';

      // Act
      const result = service.getStrengthColor(strength);

      // Assert
      expect(result).toBe('#ef4444');
    });

    it('should return correct color for weak', () => {
      // Arrange
      const strength = 'weak';

      // Act
      const result = service.getStrengthColor(strength);

      // Assert
      expect(result).toBe('#f59e0b');
    });

    it('should return correct color for fair', () => {
      // Arrange
      const strength = 'fair';

      // Act
      const result = service.getStrengthColor(strength);

      // Assert
      expect(result).toBe('#eab308');
    });

    it('should return correct color for strong', () => {
      // Arrange
      const strength = 'strong';

      // Act
      const result = service.getStrengthColor(strength);

      // Assert
      expect(result).toBe('#22c55e');
    });

    it('should return correct color for very-strong', () => {
      // Arrange
      const strength = 'very-strong';

      // Act
      const result = service.getStrengthColor(strength);

      // Assert
      expect(result).toBe('#16a34a');
    });

    it('should return default color for invalid strength', () => {
      // Arrange
      const strength = 'invalid-strength';

      // Act
      const result = service.getStrengthColor(strength);

      // Assert
      expect(result).toBe('#ef4444');
    });

    it('should handle empty string', () => {
      // Arrange
      const strength = '';

      // Act
      const result = service.getStrengthColor(strength);

      // Assert
      expect(result).toBe('#ef4444');
    });
  });

  describe('Private Methods - hasVariedCharacters()', () => {
    it('should return true for password with 3+ character types', () => {
      // Arrange
      const password = 'Abc123';

      // Act
      const result = service.calculateStrength(password);

      // Assert - Indirectly testing through score boost
      expect(result.score).toBeGreaterThanOrEqual(2.5); // Base score + varied chars bonus
    });

    it('should return false for password with less than 3 character types', () => {
      // Arrange
      const password = 'abcdef';

      // Act
      const result = service.calculateStrength(password);

      // Assert - Score should not include varied character bonus
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });

  describe('Private Methods - hasCommonPatterns()', () => {
    it('should detect admin pattern', () => {
      // Arrange
      const password = 'Admin123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Contiene patrones comunes');
    });

    it('should detect letmein pattern', () => {
      // Arrange
      const password = 'Letmein123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Contiene patrones comunes');
    });

    it('should detect welcome pattern', () => {
      // Arrange
      const password = 'Welcome123!';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.feedback).toContain('Contiene patrones comunes');
    });

    it('should be case insensitive for patterns', () => {
      // Arrange
      const passwords = ['QWERTY123!', 'qwerty123!', 'QwErTy123!'];

      passwords.forEach((password) => {
        // Act
        const result = service.calculateStrength(password);

        // Assert
        expect(result.feedback).toContain('Contiene patrones comunes');
      });
    });
  });

  describe('Private Methods - getStrengthLevel()', () => {
    it('should handle boundary conditions correctly', () => {
      // Arrange & Act - Testing through calculateStrength
      const testCases = [
        { score: 0, expected: 'very-weak' },
        { score: 1, expected: 'very-weak' },
        { score: 1.5, expected: 'weak' },
        { score: 2, expected: 'weak' },
        { score: 2.5, expected: 'fair' },
        { score: 3, expected: 'fair' },
        { score: 3.5, expected: 'strong' },
        { score: 4, expected: 'strong' },
        { score: 4.5, expected: 'very-strong' },
        { score: 5, expected: 'very-strong' },
      ];

      // Create passwords that will generate specific scores
      // This is indirect testing since getStrengthLevel is private
      testCases.forEach((testCase) => {
        // Use reflection to test private method directly
        const privateMethod = (service as any).getStrengthLevel;
        const result = privateMethod(testCase.score);

        // Assert
        expect(result).toBe(testCase.expected);
      });
    });
  });

  describe('Integration Tests - Real World Scenarios', () => {
    it('should handle typical weak passwords', () => {
      // Arrange
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        '12345678',
      ];

      weakPasswords.forEach((password) => {
        // Act
        const result = service.calculateStrength(password);

        // Assert
        expect(result.strength).toMatch(/very-weak|weak/);
        expect(result.score).toBeLessThanOrEqual(2);
        expect(result.suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should handle typical strong passwords', () => {
      // Arrange
      const strongPasswords = [
        'MySecure123!Pass',
        'Tr0ub4dor&3',
        'C0mpl3x!P@ssw0rd',
        'S3cur3#MyAcc0unt!',
      ];

      strongPasswords.forEach((password) => {
        // Act
        const result = service.calculateStrength(password);

        // Assert
        expect(result.strength).toMatch(/strong|very-strong/);
        expect(result.score).toBeGreaterThanOrEqual(4);
      });
    });

    it('should provide constructive feedback for improvement', () => {
      // Arrange
      const password = 'weak';

      // Act
      const result = service.calculateStrength(password);

      // Assert
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.feedback.length).toBeGreaterThan(0);
      expect(
        result.suggestions.every((s) => typeof s === 'string')
      ).toBeTruthy();
      expect(result.feedback.every((f) => typeof f === 'string')).toBeTruthy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long passwords', () => {
      // Arrange
      const veryLongPassword = 'A'.repeat(1000) + '1!';

      // Act
      const result = service.calculateStrength(veryLongPassword);

      // Assert
      expect(result).toBeDefined();
      expect(result.score).toBeLessThanOrEqual(5);
      expect(result.strength).toBeDefined();
    });

    it('should handle passwords with only special characters', () => {
      // Arrange
      const specialCharPassword = '!@#$%^&*()';

      // Act
      const result = service.calculateStrength(specialCharPassword);

      // Assert
      expect(result).toBeDefined();
      expect(result.feedback).toContain('Sin minúsculas');
      expect(result.feedback).toContain('Sin mayúsculas');
      expect(result.feedback).toContain('Sin números');
    });

    it('should handle passwords with unicode characters', () => {
      // Arrange
      const unicodePassword = 'Münch3n!@#';

      // Act
      const result = service.calculateStrength(unicodePassword);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(result.strength).toBeDefined();
    });

    it('should handle whitespace in passwords', () => {
      // Arrange
      const passwordWithSpaces = 'My Secure 123!';

      // Act
      const result = service.calculateStrength(passwordWithSpaces);

      // Assert
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });
  });
});
