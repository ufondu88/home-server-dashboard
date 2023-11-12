import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ServerCpuAndMemoryComponent } from './server-cpu-and-memory.component';

describe('ServerCpuAndMemoryComponent', () => {
  let component: ServerCpuAndMemoryComponent;
  let fixture: ComponentFixture<ServerCpuAndMemoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerCpuAndMemoryComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCpuAndMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
