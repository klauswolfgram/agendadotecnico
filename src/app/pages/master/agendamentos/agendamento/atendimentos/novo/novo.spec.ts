import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Novo } from './novo';

describe('Novo', () => {
  let component: Novo;
  let fixture: ComponentFixture<Novo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Novo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Novo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
