import { TestBed } from '@angular/core/testing';

import { DocxGeneratorServiceService } from '../docx-generator-service.service';

describe('DocxGeneratorServiceService', () => {
  let service: DocxGeneratorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocxGeneratorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
