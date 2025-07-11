import { Injectable } from '@angular/core';

export interface PasswordStrengthResult {
  score: number;
  feedback: string[];
  suggestions: string[];
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
}

@Injectable({
  providedIn: 'root',
})
export class PasswordStrengthService {
  calculateStrength(password: string): PasswordStrengthResult {
    if (!password) {
      return {
        score: 0,
        feedback: ['Ingresa una contraseña'],
        suggestions: ['La contraseña es requerida'],
        strength: 'very-weak',
      };
    }

    let score = 0;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Muy corta');
      suggestions.push('Usa al menos 8 caracteres');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sin minúsculas');
      suggestions.push('Agrega letras minúsculas');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sin mayúsculas');
      suggestions.push('Agrega letras mayúsculas');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sin números');
      suggestions.push('Agrega números');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sin símbolos');
      suggestions.push('Agrega símbolos especiales');
    }

    if (password.length >= 12) {
      score += 0.5;
    }

    if (this.hasVariedCharacters(password)) {
      score += 0.5;
    }

    if (this.hasCommonPatterns(password)) {
      score -= 1;
      feedback.push('Contiene patrones comunes');
      suggestions.push('Evita secuencias obvias como "123" o "abc"');
    }

    const strength = this.getStrengthLevel(score);

    return {
      score: Math.max(0, Math.min(5, score)),
      feedback: feedback.length ? feedback : ['Buena contraseña'],
      suggestions,
      strength,
    };
  }

  private hasVariedCharacters(password: string): boolean {
    const charTypes = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;

    return charTypes >= 3;
  }

  private hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /123456/,
      /abcdef/i,
      /qwerty/i,
      /password/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /(.)\1{2,}/,
      /(012|123|234|345|456|567|678|789)/,
      /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
    ];

    return commonPatterns.some((pattern) => pattern.test(password));
  }

  private getStrengthLevel(
    score: number
  ): 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong' {
    if (score <= 1) return 'very-weak';
    if (score <= 2) return 'weak';
    if (score <= 3) return 'fair';
    if (score <= 4) return 'strong';
    return 'very-strong';
  }

  getStrengthText(strength: string): string {
    const texts = {
      'very-weak': 'Muy débil',
      weak: 'Débil',
      fair: 'Regular',
      strong: 'Fuerte',
      'very-strong': 'Muy fuerte',
    };
    return texts[strength as keyof typeof texts] || 'Muy débil';
  }

  getStrengthColor(strength: string): string {
    const colors = {
      'very-weak': '#ef4444',
      weak: '#f59e0b',
      fair: '#eab308',
      strong: '#22c55e',
      'very-strong': '#16a34a',
    };
    return colors[strength as keyof typeof colors] || '#ef4444';
  }
}
