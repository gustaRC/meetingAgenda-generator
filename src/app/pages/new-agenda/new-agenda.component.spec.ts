import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAgendaComponent } from './new-agenda.component';

describe('NewAgendaComponent', () => {
  let component: NewAgendaComponent;
  let fixture: ComponentFixture<NewAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
