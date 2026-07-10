import { Component, computed, effect, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';
import { MotoristaService } from '../../services/motorista.service';
import { CategoriaCnh, DadosMotorista } from '../../models/motorista.model';
import { normalizarCpf, validadorCpf } from '../../validators/cpf.validator';
import { validadorValidadeCnh } from '../../validators/validade-cnh.validator';
import { DataAdaptadorBr, FORMATOS_DATA_BR } from '../../config/data-br';
import { MascaraDataBrDirective } from '../../directives/mascara-data-br.directive';

interface ControlesFormularioMotorista {
  nome: FormControl<string>;
  cpf: FormControl<string>;
  numeroCnh: FormControl<string>;
  categoriaCnh: FormControl<CategoriaCnh | null>;
  validadeCnh: FormControl<Date | null>;
  telefone: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  selector: 'app-formulario-motorista',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    NgxMaskDirective,
    MascaraDataBrDirective,
  ],
  templateUrl: './formulario-motorista.component.html',
  styleUrl: './formulario-motorista.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: DateAdapter, useClass: DataAdaptadorBr, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: FORMATOS_DATA_BR },
  ],
})
export class FormularioMotoristaComponent {
  private readonly motoristaService = inject(MotoristaService);
  private readonly roteador = inject(Router);

  readonly id = input<string>();

  readonly estaEditando = computed(() => this.id() !== undefined);

  readonly categoriasCnh: readonly CategoriaCnh[] = ['A', 'B', 'AB', 'C', 'D', 'E'];

  readonly formulario = new FormGroup<ControlesFormularioMotorista>({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cpf: new FormControl('', { nonNullable: true, validators: [Validators.required, validadorCpf] }),
    numeroCnh: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    categoriaCnh: new FormControl<CategoriaCnh | null>(null, { validators: [Validators.required] }),
    validadeCnh: new FormControl<Date | null>(null, {
      validators: [Validators.required, validadorValidadeCnh],
    }),
    telefone: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
  });

  constructor() {
    effect(() => {
      const idMotorista = this.id();
      const motorista = idMotorista ? this.motoristaService.buscarPorId(idMotorista) : undefined;

      if (motorista) {
        this.formulario.patchValue(motorista);
      }
    });
  }

  salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const dadosMotorista: DadosMotorista = {
      nome: valores.nome,
      cpf: normalizarCpf(valores.cpf),
      numeroCnh: valores.numeroCnh,
      categoriaCnh: valores.categoriaCnh!,
      validadeCnh: valores.validadeCnh!,
      telefone: valores.telefone || undefined,
      email: valores.email || undefined,
    };

    const idMotorista = this.id();
    if (idMotorista) {
      this.motoristaService.atualizar(idMotorista, dadosMotorista);
    } else {
      this.motoristaService.adicionar(dadosMotorista);
    }

    this.roteador.navigate(['/motoristas']);
  }
}
