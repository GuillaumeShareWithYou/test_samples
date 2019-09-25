package com.rte_france.decofer.api.service;

import com.rte_france.decofer.api.client.datawarehouse.DwhEmsSnapshotClient;
import com.rte_france.decofer.api.client.datawarehouse.model.DwhEmsSnapshotDTO;
import com.rte_france.decofer.api.client.reference.CommunicationConfigClient;
import com.rte_france.decofer.api.client.reference.model.CommunicationConfigDTO;
import com.rte_france.decofer.api.client.reference.model.EmsDTO;
import com.rte_france.decofer.api.service.dto.ChangeCommunicationConfigDTO;
import com.rte_france.decofer.api.service.mapper.ChangeCommunicationConfigMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class CommunicationConfigServiceTest {

    @InjectMocks
    private CommunicationConfigService communicationConfigService;

    @Mock
    private ChangeCommunicationConfigMapper changeCommunicationConfigMapper ;

    @Mock
    private DwhEmsSnapshotClient dwhEmsSnapshotClient;

    @Mock
    private CommunicationConfigClient communicationConfigClient;


    @Test
    public void findById() {
        long id = 1L;
        communicationConfigService.findById(id);
        verify(communicationConfigClient).getCommunicationConfigById(eq(id));
    }

    @Test
    public void findByIdAndConvertToChangeCommunicationConfigDTO() throws Exception {
        long id = 1L;
        DwhEmsSnapshotDTO emsSnapshotDTO = new DwhEmsSnapshotDTO();
        OffsetDateTime now = OffsetDateTime.now();
        emsSnapshotDTO.setLastCommunicationConfigIntegrationDate(now);
        CommunicationConfigDTO communicationConfigDTO = new CommunicationConfigDTO();
        EmsDTO ems = new EmsDTO();
        communicationConfigDTO.setEms(ems);
        UUID uuid = UUID.randomUUID();
        // setting the guid using reflection
        Field field = EmsDTO.class.getDeclaredField("guid");
        field.setAccessible(true);
        field.set(ems, uuid);
        assert ems.getGuid().equals(uuid);

        when(communicationConfigClient.getCommunicationConfigById(eq(id)))
            .thenReturn(communicationConfigDTO);
        when(changeCommunicationConfigMapper.toDto(any(CommunicationConfigDTO.class)))
            .thenReturn(new ChangeCommunicationConfigDTO());
        when( dwhEmsSnapshotClient.getByEms(any(UUID.class)))
            .thenReturn(emsSnapshotDTO);
        ChangeCommunicationConfigDTO answer = communicationConfigService.findByIdAndConvertToChangeCommunicationConfigDTO(id);
        verify(communicationConfigClient).getCommunicationConfigById(eq(id));

        assertThat(answer.getDate()).isEqualTo(now);
    }
}
