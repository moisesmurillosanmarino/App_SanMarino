import { Pipe, PipeTransform } from '@angular/core';
import { LoteDto } from '../services/lote.service';

@Pipe({
  name: 'loteFilter',
  standalone: true
})
export class LoteFilterPipe implements PipeTransform {
  transform(
    lotes: LoteDto[],
    search: string = '',
    farmMap: Record<number, string>,
    nucleoMap: Record<string, string>,
    galponMap: Record<string, string>
  ): LoteDto[] {
    if (!lotes || !search.trim()) return lotes;

    const term = search.trim().toLowerCase();

    return lotes.filter(l => {
      const nombre     = l.loteNombre?.toLowerCase() || '';
      const id         = l.loteId?.toLowerCase() || '';
      const granja     = farmMap[l.granjaId]?.toLowerCase() || '';
      const nucleo     = nucleoMap[l.nucleoId?.toString() || '']?.toLowerCase() || '';
      const galpon     = galponMap[l.galponId?.toString() || '']?.toLowerCase() || '';

      return nombre.includes(term) || id.includes(term) || granja.includes(term) || nucleo.includes(term) || galpon.includes(term);
    });
  }
}
