import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarIntervalComponent } from 'app/calendar-interval/calendar-interval.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteModule, Calendar, SharedModule } from 'primeng/primeng';
import { PortalTestModule } from '../../../test.module';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as moment from 'moment';

describe('CalendarIntervalComponent', () => {
    let component: CalendarIntervalComponent;
    let fixture: ComponentFixture<CalendarIntervalComponent>;

    const endOfToday = moment()
        .endOf('days')
        .toDate();
    const intervalSize = 7;
    describe('test without hours', () => {
        beforeEach(
            async(() => {
                TestBed.configureTestingModule({
                    declarations: [CalendarIntervalComponent, Calendar],
                    imports: [ReactiveFormsModule, SharedModule, PortalTestModule, TranslateModule.forRoot()],
                    schemas: [NO_ERRORS_SCHEMA]
                }).compileComponents();
            })
        );

        beforeEach(() => {
            fixture = TestBed.createComponent(CalendarIntervalComponent);
            component = fixture.componentInstance;
            component.setMaxIntervalSize(intervalSize);
            component.setEmptyByDefault(false);
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });
        it('should only allow past dates (endDate)', done => {
            // GIVEN
            component.setOnlyInPast(true);
            const later = moment()
                .add(5, 'days')
                .toDate();

            // WHEN
            component.setDatePeriod({ startDate: null, endDate: later });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                const expectedStart = moment(endOfToday).add(-intervalSize + 1, 'days');
                expect(component.getDatePeriod().startDate.getTime()).toEqual(expectedStart.toDate().getTime());
                expect(component.getDatePeriod().endDate.getTime()).toEqual(endOfToday.getTime());
                done();
            });
        });
        it('should only allow date in past (startDate)', done => {
            // GIVEN
            component.setOnlyInPast(true);
            const start = moment()
                .add(5, 'days')
                .toDate();

            // WHEN
            component.setDatePeriod({ startDate: start });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                expect(component.getDatePeriod().startDate.getTime()).toEqual(endOfToday.getTime());
                expect(component.getDatePeriod().endDate.getTime()).toEqual(endOfToday.getTime());
                done();
            });
        });
        it('should allow past dates (startDate) and set end date well', done => {
            // GIVEN
            component.setOnlyInPast(true);
            const start = moment()
                .add(5, 'days')
                .toDate();

            // WHEN
            component.setDatePeriod({ startDate: start });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                expect(component.getDatePeriod().startDate.getTime()).toEqual(endOfToday.getTime());
                expect(component.getDatePeriod().endDate.getTime()).toEqual(endOfToday.getTime());
                done();
            });
        });
        it('should allow when future is authorized', done => {
            // GIVEN
            component.setOnlyInPast(false);
            const start = moment()
                .add(5, 'days')
                .toDate();
            const end = moment()
                .add(9, 'days')
                .toDate();

            // WHEN
            component.setDatePeriod({ startDate: start, endDate: end });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                expect(component.getDatePeriod().startDate.getTime()).toEqual(start.getTime());
                expect(component.getDatePeriod().endDate.getTime()).toEqual(end.getTime());
                done();
            });
        });
        it('should reduce the interval', done => {
            const startDay = 30;
            // GIVEN
            component.setOnlyInPast(false);
            const start = moment()
                .add(startDay, 'days')
                .toDate();
            const endOverflow = 2;
            const end = moment()
                .add(startDay + (intervalSize - 1) + endOverflow, 'days')
                .toDate();

            // WHEN
            component.setDatePeriod({ startDate: start, endDate: end });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                const limit = moment(end)
                    .add(-endOverflow, 'days')
                    .endOf('days')
                    .toDate();
                expect(component.getDatePeriod().startDate.getTime()).toEqual(start.getTime());
                expect(component.getDatePeriod().endDate.getTime()).toEqual(limit.getTime());
                done();
            });
        });
        it('should have good min and max dates in past', done => {
            // GIVEN
            component.setOnlyInPast(true);
            const start = moment()
                .add(-5, 'days')
                .toDate();
            const end = moment().toDate();

            // WHEN
            component.setDatePeriod({ startDate: start, endDate: end });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                expect(component.maxStartDate.getTime()).toEqual(endOfToday.getTime());
                expect(component.minEndDate.getTime()).toEqual(start.getTime());
                expect(component.maxEndDate.getTime()).toEqual(
                    moment()
                        .endOf('days')
                        .toDate()
                        .getTime()
                );
                done();
            });
        });

        it('should have good min and max dates', done => {
            const offset = 18;
            const offsetBefore = 2;
            // GIVEN
            component.setOnlyInPast(false);
            const start = moment()
                .add(-offsetBefore, 'days')
                .toDate();
            const end = moment()
                .add(offset, 'days')
                .toDate();

            // WHEN
            component.setDatePeriod({ startDate: start, endDate: end });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                const expectedMaxEnd = moment()
                    .add(intervalSize - 1 - offsetBefore, 'days')
                    .endOf('days');

                expect(component.maxEndDate.getTime()).toEqual(expectedMaxEnd.toDate().getTime());
                expect(component.maxStartDate).toBeNull();
                expect(component.minEndDate.getTime()).toEqual(start.getTime());
                done();
            });
        });

        it('should not have max start date when future is authorized', done => {
            // GIVEN
            component.setOnlyInPast(false);
            const start = moment()
                .add(-3, 'days')
                .toDate();
            const end = moment()
                .add(3, 'days')
                .toDate();

            // WHEN
            component.setDatePeriod({ startDate: start, endDate: end });
            fixture.detectChanges();

            // THEN
            fixture.whenStable().then(() => {
                expect(component.maxStartDate).toBeNull();
                expect(component.maxEndDate).toEqual(
                    moment(start)
                        .add(intervalSize - 1, 'days')
                        .endOf('days')
                        .toDate()
                );
                done();
            });
        });
    });
    describe('test with hours', () => {
        beforeEach(
            async(() => {
                TestBed.configureTestingModule({
                    declarations: [CalendarIntervalComponent, Calendar],
                    imports: [ReactiveFormsModule, AutoCompleteModule, SharedModule, PortalTestModule, TranslateModule.forRoot()],
                    schemas: [NO_ERRORS_SCHEMA]
                }).compileComponents();
            })
        );

        beforeEach(() => {
            fixture = TestBed.createComponent(CalendarIntervalComponent);
            component = fixture.componentInstance;
            component.setDueTime(0); // to speed up the testing process
            component.setMaxIntervalSize(intervalSize);
            component.setEmptyByDefault(false);
            component.setChangeHours(true);
            spyOn(component, 'getCurrentHour').and.returnValue(23);
            fixture.detectChanges();
        });
        it('should set default hours to current hour', done => {
            // ASSUMING currentHour as real current hour of the system
            const currentHour = component.getCurrentHour();
            fixture.whenStable().then(() => {
                expect(component.defaultEndHour).toEqual(currentHour);
                expect(component.defaultStartHour).toEqual(currentHour - 1);
                done();
            });
        });
        it('validate should return null when no errors', done => {
            fixture.whenStable().then(() => {
                expect(component.validate(null)).toBeNull();
                done();
            });
        });
        it('validate should return error when empty required field', done => {
            // GIVEN one required field is empty
            component.form.get('startHour').setValue(null);
            fixture.whenStable().then(() => {
                // THEN
                expect(component.validate(null)).not.toBeNull();
                done();
            });
        });

        it('should return all available hours when no query for start date', done => {
            // GIVEN

            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            const event = { query: '' };
            fixture.whenStable().then(() => {
                // WHEN
                const hours = component.completeStartHour(event);
                // THEN
                expect(hours.length).toEqual(component.getMaxStartHour() + 1);
                expect(hours[0]).toEqual(0);
                expect(hours[hours.length - 1]).toEqual(component.getMaxStartHour());
                done();
            });
        });
        it('should return 1, 10, 11, 12 ... for query 1 if not today', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            const event = { query: '1' };
            fixture.whenStable().then(() => {
                // WHEN
                const hours = component.completeStartHour(event);
                // THEN
                expect(hours.length).toEqual(11);
                expect(hours[0]).toEqual(1);
                expect(hours[hours.length - 1]).toEqual(19);
                done();
            });
        });
        it('should return 2, 20, 21, 22, 23 for query 2 if not today', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            const event = { query: '2' };
            fixture.whenStable().then(() => {
                // WHEN
                const hours = component.completeStartHour(event);
                // THEN
                expect(hours.length).toEqual(5);
                expect(hours[0]).toEqual(2);
                expect(hours[hours.length - 1]).toEqual(23);
                done();
            });
        });
        it('should return 0, 1, 2, 3..9 for query 0 if not today', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            const event = { query: '0' };
            fixture.whenStable().then(() => {
                // WHEN
                const hours = component.completeStartHour(event);
                // THEN
                expect(hours.length).toEqual(10);
                expect(hours[0]).toEqual(0);
                expect(hours[hours.length - 1]).toEqual(9);
                done();
            });
        });
        it('should return the available interval between min and max date for end hour', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(day);
            component.form.get('startHour').patchValue('10');
            component.form.get('endHour').patchValue('15');
            component.computeMinEndHour();
            component.computeMaxEndHour();
            const event = { query: '' };
            fixture.whenStable().then(() => {
                // WHEN
                const hours = component.completeEndHour(event);
                // THEN
                expect(hours.length).toEqual(13);
                expect(hours[0]).toEqual(11);
                expect(hours[hours.length - 1]).toEqual(23);
                done();
            });
        });
        it('should return the available interval midnight and current hour if today and no query', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);

            const currentHour = component.getCurrentHour();
            component.computeMinEndHour();
            component.computeMaxEndHour();
            const event = { query: '' };
            fixture.whenStable().then(() => {
                // WHEN
                const hours = component.completeEndHour(event);
                // THEN
                expect(hours.length).toEqual(currentHour + 1);
                expect(hours[0]).toEqual(0);
                expect(hours[hours.length - 1]).toEqual(currentHour);
                done();
            });
        });
        it('should return the available interval with query 1', done => {
            // GIVEN
            const startHour = 13;
            component.form.get('startDate').setValue(new Date());
            component.form.get('endDate').setValue(new Date());
            component.form.get('startHour').patchValue(startHour);
            component.form.get('endHour').patchValue(15);
            component.computeMinEndHour();
            component.computeMaxEndHour();
            const event = { query: '1' };
            fixture.whenStable().then(() => {
                // WHEN
                const hours = component.completeEndHour(event);
                // THEN
                expect(hours.length).toEqual(6);
                expect(hours[0]).toEqual(startHour + 1);
                expect(hours[hours.length - 1]).toEqual(19);
                done();
            });
        });

        it('should patch value to the correct format', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(new Date(day));
            component.form.get('startHour').patchValue('5');
            component.form.get('endHour').patchValue('17');
            component.computeMinEndHour();
            component.computeMaxEndHour();

            fixture.whenStable().then(() => {
                const endHourControl = <FormControl>component.form.get('endHour');
                const spy = spyOn(endHourControl, 'patchValue');
                component.patchToHourFormat('14', endHourControl);
                expect(spy).toBeCalledWith('14h00', { emitEvent: false });
                done();
            });
        });
        it('should not patch value if out of bounds hour', done => {
            // GIVEN
            component.form.get('startDate').setValue(new Date());
            component.form.get('endDate').setValue(new Date());
            component.computeMinEndHour();
            component.computeMaxEndHour();
            const hourTooLate = component.getCurrentHour() + 1;

            fixture.whenStable().then(() => {
                const endHourControl = <FormControl>component.form.get('endHour');
                const spy = spyOn(endHourControl, 'patchValue');
                component.patchToHourFormat(hourTooLate, endHourControl);
                expect(spy).not.toBeCalled();
                done();
            });
        });
        it('should patch empty string if bad input', done => {
            fixture.whenStable().then(() => {
                const endHourControl = <FormControl>component.form.get('endHour');
                const spy = spyOn(endHourControl, 'patchValue');
                component.patchToHourFormat('hhh', endHourControl);
                expect(spy).toBeCalledWith('', { emitEvent: false });
                done();
            });
        });
        it('should emit event if parameters is true', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(new Date(day));
            component.form.get('startHour').patchValue('5');
            component.form.get('endHour').patchValue('17');
            component.computeMinEndHour();
            component.computeMaxEndHour();
            fixture.whenStable().then(() => {
                const endHourControl = <FormControl>component.form.get('endHour');
                const spy = spyOn(endHourControl, 'patchValue');
                component.patchToHourFormat('12', endHourControl, true);
                expect(spy).toBeCalledWith('12h00', { emitEvent: true });
                done();
            });
        });

        /* ___________________ */
        it('handleStartHourChanges should do nothing if hour is not given', done => {
            fixture.whenStable().then(() => {
                const patch = spyOn(component, 'patchToHourFormat');
                const validate = spyOn(component, 'validateHourOrChangeIt');
                component.handleStartHourChanges('', '');
                expect(patch).not.toBeCalled();
                expect(validate).not.toBeCalled();
                done();
            });
        });
        it('handleStartHourChanges should patch without emitting if hour is equals to prev', done => {
            fixture.whenStable().then(() => {
                const patch = spyOn(component, 'patchToHourFormat');
                const validate = spyOn(component, 'validateHourOrChangeIt');
                component.handleStartHourChanges('14h00', '14');
                expect(patch).toBeCalledWith('14', <FormControl>component.form.get('startHour'), false);
                expect(validate).not.toBeCalled();
                done();
            });
        });
        it('handleStartHourChanges should validate if hour is not equals to prev', done => {
            fixture.whenStable().then(() => {
                const patch = spyOn(component, 'patchToHourFormat');
                const validate = spyOn(component, 'validateHourOrChangeIt');
                component.handleStartHourChanges('11h00', '14');
                expect(patch).not.toBeCalled();
                expect(validate).toBeCalledWith(<FormControl>component.form.get('startHour'));
                done();
            });
        });
        /* __________SAME WITH END HOUR_________ */
        it('handleEndHourChanges should do nothing if hour is not given', done => {
            fixture.whenStable().then(() => {
                const patch = spyOn(component, 'patchToHourFormat');
                const validate = spyOn(component, 'validateHourOrChangeIt');
                component.handleEndHourChanges('', '');
                expect(patch).not.toBeCalled();
                expect(validate).not.toBeCalled();
                done();
            });
        });
        it('handleEndHourChanges should patch without emitting if hour is equals to prev', done => {
            fixture.whenStable().then(() => {
                const patch = spyOn(component, 'patchToHourFormat');
                const validate = spyOn(component, 'validateHourOrChangeIt');
                component.handleEndHourChanges('14h00', '14');
                expect(patch).toBeCalledWith('14', <FormControl>component.form.get('endHour'), false);
                expect(validate).not.toBeCalled();
                done();
            });
        });
        it('handleEndHourChanges should validate if hour is not equals to prev', done => {
            fixture.whenStable().then(() => {
                const patch = spyOn(component, 'patchToHourFormat');
                const validate = spyOn(component, 'validateHourOrChangeIt');
                component.handleEndHourChanges('11h00', '14');
                expect(patch).not.toBeCalled();
                expect(validate).toBeCalledWith(<FormControl>component.form.get('endHour'));
                done();
            });
        });
        it('should increment start hour on arrow up', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(new Date(day));
            component.form.get('startHour').patchValue('10');
            component.form.get('endHour').patchValue('15');
            component.computeMinEndHour();
            component.computeMaxEndHour();
            fixture.whenStable().then(() => {
                const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
                const setStartHour = spyOn(component, 'setStartHour');
                // WHEN
                component.handleStartHourKeyboardEvent(event);
                // THEN
                expect(setStartHour).toBeCalledWith(11, true);
                done();
            });
        });
        it('should decrement start hour on arrow down', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(new Date(day));
            component.form.get('startHour').patchValue('10');
            component.form.get('endHour').patchValue('15');
            component.computeMinEndHour();
            component.computeMaxEndHour();
            fixture.whenStable().then(() => {
                const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
                const setStartHour = spyOn(component, 'setStartHour');
                // WHEN
                component.handleStartHourKeyboardEvent(event);
                // THEN
                expect(setStartHour).toBeCalledWith(9, true);
                done();
            });
        });
        it('should increment end hour on arrow up', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(new Date(day));
            component.form.get('startHour').patchValue('10');
            component.form.get('endHour').patchValue('15');
            component.computeMinEndHour();
            component.computeMaxEndHour();
            fixture.whenStable().then(() => {
                const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
                const setEndHour = spyOn(component, 'setEndHour');
                // WHEN
                component.handleEndHourKeyboardEvent(event);
                // THEN
                expect(setEndHour).toBeCalledWith(16, true);
                done();
            });
        });
        it('should decrement end hour on arrow down', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(new Date(day));
            component.form.get('startHour').patchValue('10');
            component.form.get('endHour').patchValue('15');
            component.computeMinEndHour();
            component.computeMaxEndHour();
            fixture.whenStable().then(() => {
                const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
                const setEndHour = spyOn(component, 'setEndHour');
                // WHEN
                component.handleEndHourKeyboardEvent(event);
                // THEN
                expect(setEndHour).toBeCalledWith(14, true);
                done();
            });
        });
        it('should not handle the keyboard events when suggestions dropdown is shown (end hour version)', done => {
            component.endHourAutocomplete = {
                overlayVisible: true
            } as AutoComplete;
            fixture.whenStable().then(() => {
                const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
                const setEndHour = spyOn(component, 'setEndHour');
                // WHEN
                component.handleEndHourKeyboardEvent(event);
                // THEN
                expect(setEndHour).not.toBeCalled();
                done();
            });
        });
        it('should not handle the keyboard events when suggestions dropdown is shown (start hour version)', done => {
            component.startHourAutocomplete = {
                overlayVisible: true
            } as AutoComplete;
            fixture.whenStable().then(() => {
                const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
                const setStartHour = spyOn(component, 'setStartHour');
                // WHEN
                component.handleStartHourKeyboardEvent(event);
                // THEN
                expect(setStartHour).not.toBeCalled();
                done();
            });
        });
        it('when start hour is 23h00 and not today => set end hour to 00h00', done => {
            // GIVEN
            const day = new Date();
            day.setDate(day.getDate() - 1);
            component.form.get('startDate').setValue(day);
            component.form.get('endDate').setValue(new Date(day));
            component.form.get('startHour').patchValue(23);
            component.form.get('endHour').patchValue(0);
            component.computeMinEndHour();
            component.computeMaxEndHour();
            // WHEN
            fixture.whenStable().then(() => {
                const setEndHour = spyOn(component, 'setEndHour');
                component.handleHoursChanged();
                // THEN
                expect(setEndHour).toBeCalledWith(0);
                done();
            });
        });
        it('when today and start hour is 23h00 => set start at 22h00 and end at 23h00', done => {
            // GIVEN
            component.form.get('startDate').setValue(new Date());
            component.form.get('endDate').setValue(new Date());
            component.form.get('startHour').patchValue(23); // try to increment start hour
            component.form.get('endHour').patchValue(23);
            component.computeMinEndHour();
            component.computeMaxEndHour();
            // WHEN
            fixture.whenStable().then(() => {
                const setStartHour = spyOn(component, 'setStartHour');
                const setEndHour = spyOn(component, 'setEndHour');
                component.handleHoursChanged();
                // THEN
                expect(setStartHour).toBeCalledWith(22);
                expect(setEndHour).toBeCalledWith(23);
                done();
            });
        });

        it('should setValue on writeValue', done => {
            // WHEN
            fixture.whenStable().then(() => {
                const value = 'SNCF';
                const spy = spyOn(component.form, 'setValue');
                component.writeValue(value);
                expect(spy).toBeCalledWith(value, { emitEvent: false });
                done();
            });
        });

        it('should reset to default dates', () => {
            fixture.whenStable().then(() => {
                const patchStart = spyOn(component.form.get('startDate'), 'patchValue');
                const patchEnd = spyOn(component.form.get('endDate'), 'patchValue');
                // WHEN
                component.resetToDefaultsDate();
                // THEN
                expect(patchStart).toHaveBeenCalledWith(component.defaultStartDate);
                expect(patchEnd).toHaveBeenCalledWith(component.defaultEndDate);
            });
        });
    });
});
