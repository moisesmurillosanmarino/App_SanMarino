import { Pipe, PipeTransform } from '@angular/core';
import { NucleoDto } from '../services/nucleo.service';
import { FarmDto } from '../../farm/services/farm.service';
import { Company } from '../../../core/services/company/company.service';


@Pipe({
  name: 'nucleoFilter',
  standalone: true
})
export class NucleoFilterPipe implements PipeTransform {
  transform(nucleos: NucleoDto[], filtro: string, farms: FarmDto[], companies: Company[]): NucleoDto[] {
    if (!filtro?.trim()) return nucleos;
    const value = filtro.toLowerCase();
    return nucleos.filter(n => {
      const granja = farms.find(f => f.id === n.granjaId);
      const empresa = granja ? companies.find(c => c.id === granja.companyId) : null;
      return (
        n.nucleoId.toLowerCase().includes(value) ||
        n.nucleoNombre.toLowerCase().includes(value) ||
        granja?.name?.toLowerCase().includes(value) ||
        empresa?.name?.toLowerCase().includes(value)
      );
    });
  }
}
