import { Pipe, PipeTransform } from '@angular/core';
import { GalponDto } from '../services/galpon.service';
import { NucleoDto } from '../../nucleo/services/nucleo.service';
import { FarmDto } from '../../farm/services/farm.service';
import { Company } from '../../../core/services/company/company.service';


@Pipe({
  name: 'galponFilter',
  standalone: true
})
export class GalponFilterPipe implements PipeTransform {
  transform(galpones: GalponDto[], filtro: string, nucleos: NucleoDto[], farms: FarmDto[], companies: Company[]): GalponDto[] {
    if (!filtro?.trim()) return galpones;
    const f = filtro.toLowerCase();
    return galpones.filter(g => {
      const nucleo = nucleos.find(n => n.nucleoId === g.galponNucleoId);
      const farm = farms.find(fr => fr.id === g.granjaId);
      const company = farm ? companies.find(c => c.id === farm.companyId) : null;
      return (
        g.galponNombre?.toLowerCase().includes(f) ||
        g.tipoGalpon?.toLowerCase().includes(f) ||
        nucleo?.nucleoNombre?.toLowerCase().includes(f) ||
        farm?.name?.toLowerCase().includes(f) ||
        company?.name?.toLowerCase().includes(f)
      );
    });
  }
}
